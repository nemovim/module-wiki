import type { Doc, DocState } from '../types/doc';
import type { Authority } from '../types/authority';
import type { Hist } from '../types/hist';
import type { User } from '../types/user';

import HangulSearcher, { type SearchResult } from 'hangul-searcher';
import { type Change, diffWords } from 'diff';

import AuthorityManager from './authority';
import CategoryManager from './category';
import DocManager from './doc';

import WikiTranslator from '../utils/translator';
import TitleUtils from '../utils/title';

import InfoController from '../controllers/info';
import HistController from '../controllers/hist';
import CommonController from '../controllers/common';

export default class WikiManager {

    static async isInitialized(): Promise<boolean> {
        // WikiTranslator.overrideAnchorLinkParser();
        const categoryInfo = await InfoController.getInfoByFullTitle('분류:분류');
        return categoryInfo == null ? false : true;
    }

    static async init(): Promise<void> {
        const systemUser: User = AuthorityManager.getSystemUser();

        const uncategorizedDoc = DocManager.createNewDocByFullTitle('분류:미분류', systemUser);
        uncategorizedDoc.authority['write'] = ['system', 'manager', 'dev'];
        uncategorizedDoc.markup = '[#[분류]]';

        const categorizedDoc = DocManager.createNewDocByFullTitle(
            '분류:분류',
            systemUser,
            {
                categorizedArr: [uncategorizedDoc.docId]
            }
        );
        categorizedDoc.authority['write'] = ['system', 'manager', 'dev'];
        categorizedDoc.markup = '';

        await DocManager.setNewDocByDoc(categorizedDoc);
        await DocManager.setNewDocByDoc(uncategorizedDoc);
    }

    static async createHTMLByDoc(doc: Doc): Promise<string> {
        if (doc.type === 'general' || doc.type === 'special') {
            return WikiTranslator.translate(doc.markup, doc.fullTitle);
        } else if (doc.type === 'category') {
            const categoryMarkup =
                await CategoryManager.createCategoryMarkupByCategorizedArr(
                    doc.categorizedArr
                );
            return WikiTranslator.translate(doc.markup + categoryMarkup, doc.fullTitle);
        } else {
            throw new Error('Undexpected DocType');
        }
    }

    static async readDocByFullTitle(fullTitle: string, user: User, revision = -1): Promise<Doc | null> {
        const doc = await DocManager.getDocByFullTitle(fullTitle, revision);
        if (doc === null) {
            return null;
        } else if (AuthorityManager.canDo('read', doc, user.group)) {
            doc.html = await this.createHTMLByDoc(doc);
            return doc;
        } else {
            throw new Error('Cannot Read');
        }
    }


    static async writeDocByFullTitle(fullTitle: string, user: User, markup: string, comment: string = ''): Promise<void> {
        const prevDoc = await DocManager.getDocByFullTitle(fullTitle, -1);
        if (prevDoc === null) {
            // write new doc
            const newDoc = DocManager.createNewDocByFullTitle(
                fullTitle,
                user,
                {
                    markup,
                    comment
                }
            );

            if (TitleUtils.getPrefixAndTitleByFullTitle(fullTitle)[0] === '분류') {
                if (!AuthorityManager.canWriteNewWiki(user.group)) {
                    throw new Error('Cannot Write Wiki Doc');
                }
            }

            if (!AuthorityManager.canDo('write', newDoc, user.group))
                throw new Error('Cannot Write');

            await CategoryManager.categorizeDoc(prevDoc, newDoc);
            await DocManager.setNewDocByDoc(newDoc);

        } else if (AuthorityManager.canDo('write', prevDoc, user.group)) {
            // write nextDoc
            const nextDoc = DocManager.createNextDocByPrevInfo(
                prevDoc,
                user,
                markup,
                comment,
            );

            await CategoryManager.categorizeDoc(prevDoc, nextDoc);
            if (nextDoc.state === 'deleted') {
                await DocManager.setDeletedDocByDoc(nextDoc);
            } else {
                await DocManager.setNextDocByDoc(nextDoc);
            }
        } else {
            throw new Error('Cannot Write');
        }
    }

    static async moveDocByFullTitle(fullTitle: string, user: User, newFullTitle: string, comment: string = ''): Promise<void> {

        const prevDoc = await DocManager.getDocByFullTitle(fullTitle);

        if (prevDoc === null)
            throw new Error('The document does not exist yet');

        if (AuthorityManager.canDo('move', prevDoc, user.group))
            throw new Error('Cannot Move');

        if (prevDoc.type === 'category')
            throw new Error('Cannot move category docs by force');

        await DocManager.moveDocByInfo(prevDoc, user, newFullTitle, comment);
    }

    static async updateAuthorityByFullTitle(fullTitle: string, user: User, authority: Authority, comment: string = ''): Promise<void> {

        const prevDoc = await DocManager.getDocByFullTitle(fullTitle);

        if (prevDoc === null)
            throw new Error('The document does not exist yet');

        if (AuthorityManager.canDo('authority', prevDoc, user.group))
            throw new Error('Cannot Update Authority');

        prevDoc.authority = authority;
        prevDoc.comment = comment || '';
        await InfoController.updateInfoByDoc(prevDoc);
    }

    static async updateStateByFullTitle(fullTitle: string, user: User, state: DocState, comment: string = ''): Promise<void> {

        const prevDoc = await DocManager.getDocByFullTitle(fullTitle);

        if (prevDoc === null)
            throw new Error('The document does not exist yet');

        if (AuthorityManager.canDo('state', prevDoc, user.group))
            throw new Error('Cannot Update DocState');

        prevDoc.state = state;
        prevDoc.comment = comment || '';
        await InfoController.updateInfoByDoc(prevDoc);
    }

    static async deleteDocByFullTitle(fullTitle: string, user: User, comment: string = ''): Promise<void> {
        const prevDoc = await DocManager.getDocByFullTitle(fullTitle);
        if (prevDoc === null) {
            throw new Error('The document does not exist yet');
        } else if (
            AuthorityManager.canDo('delete', prevDoc, user.group) &&
            prevDoc.type != 'category'
        ) {
            const nextDoc = {
                docId: prevDoc.docId,
                markup: ''
            }
            await CategoryManager.categorizeDoc(prevDoc, nextDoc, true);
            await DocManager.deleteDocByInfo(prevDoc, user, comment);
        } else {
            throw new Error('Cannot Delete');
        }
    }

    static async getHistsByFullTitle(
        fullTitle: string,
        user: User,
        fromRev: number,
        toRev = -1
    ): Promise<Hist[] | null> {
        const doc = await DocManager.getDocByFullTitle(fullTitle, -1);
        if (doc === null) {
            return null;
        } else if (AuthorityManager.canDo('read', doc, user.group)) {
            if (toRev < 0) {
                toRev = doc.revision + toRev + 1;
            }
            if (toRev <= 0) {
                toRev = 1;
            }
            if (fromRev < 0) {
                fromRev = toRev + fromRev + 1;
            }
            if (fromRev <= 0) {
                fromRev = 1;
            }
            if (fromRev <= toRev) {
                return await HistController.getHistsByDocId(
                    doc.docId,
                    fromRev,
                    toRev
                );
            } else {
                throw new Error('The range of revision is wrong');
            }
        } else {
            throw new Error('Cannot Read');
        }
    }

    static async compareDocByFullTitle(fullTitle: string, user: User, oldRev: number, newRev: number): Promise<{ diff: Change[], oldDoc: Doc | null, newDoc: Doc | null }> {
        const oldDoc = await this.readDocByFullTitle(fullTitle, user, oldRev);
        const newDoc = await this.readDocByFullTitle(fullTitle, user, newRev);
        return {
            diff: diffWords(oldDoc?.markup || '', newDoc?.markup || ''),
            oldDoc,
            newDoc,
        };
    }

    static async searchDoc(searchWord: string): Promise<{ status: 'exact' | 'searched', result: Array<string | SearchResult> }> {
        const fullTitleArr = await CommonController.getAllFullTitles();
        const hangulSearcher = new HangulSearcher(fullTitleArr);
        const searchResultArr = hangulSearcher.search(searchWord);
        if (searchResultArr.length !== 0 && searchResultArr[0] === searchWord) {
            // Exact match
            return {
                status: 'exact',
                result: [searchWord],
            };
        } else {
            return {
                status: 'searched',
                result: searchResultArr,
            };
        }
    }


}
