import type { Doc, DocState } from '../types/doc';
import type { Group } from '../types/authority';
import type { User } from '../types/user';
import type { DocAction, DocLogDoc } from '../types/log';

import HangulSearcher, { type SearchResult } from 'hangul-searcher';
import { type Change, diffWords } from 'diff';

import AuthorityManager from './authority.js';
import CategoryManager from './category.js';
import DocManager from './doc.js';

import WikiTranslator from '../utils/translator.js';
import TitleUtils from '../utils/title.js';

import InfoController from '../controllers/info.js';
import CommonController from '../controllers/common.js';
import LogController from '../controllers/log.js';

export default class WikiManager {

    static async isInitialized(): Promise<boolean> {
        // WikiTranslator.overrideAnchorLinkParser();
        const categoryInfo = await InfoController.getInfoByFullTitle('분류:분류');
        return categoryInfo == null ? false : true;
    }

    static async init(): Promise<void> {
        const systemUser: User = AuthorityManager.getSystemUser();

        const uncategorizedDoc = DocManager.createNewEmptyDocByFullTitle('분류:미분류');
        uncategorizedDoc.authority['edit'] = ['system', 'manager', 'dev'];
        uncategorizedDoc.markup = '[#[분류]]';

        const categorizedDoc = DocManager.createNewEmptyDocByFullTitle('분류:분류');
        categorizedDoc.categorizedArr = [uncategorizedDoc.docId]
        categorizedDoc.authority['edit'] = ['system', 'manager', 'dev'];
        categorizedDoc.markup = '';

        await DocManager.createDocByDoc(null, uncategorizedDoc, systemUser);
        await DocManager.createDocByDoc(null, categorizedDoc, systemUser);
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

    static async writeDocByFullTitle(fullTitle: string, user: User, markup: string, comment?: string): Promise<void> {
        const prevDoc = await DocManager.getDocByFullTitle(fullTitle, -1);

        if (!prevDoc ||prevDoc?.state === 'deleted') {
            await this.#createDocByFullTitle(fullTitle, user, markup, comment);
        } else if (prevDoc) {
            await this.#editDocByFullTitle(fullTitle, user, markup, comment);
        }
    }

    static async #createDocByFullTitle(fullTitle: string, user: User, markup: string, comment?: string): Promise<void> {
        if (TitleUtils.getPrefixAndTitleByFullTitle(fullTitle)[0] === '위키' && !AuthorityManager.canCreateWiki(user.group))
            throw new Error('Cannot create wiki doc');

        const prevDoc = await DocManager.getDocByFullTitle(fullTitle, -1);
        const nextDoc = DocManager.createNewEmptyDocByFullTitle(fullTitle);

        if (prevDoc && prevDoc.state === 'deleted') {
            nextDoc.authority = prevDoc.authority;
            nextDoc.docId = prevDoc.docId;
            nextDoc.revision = prevDoc.revision + 1;
        } else if (prevDoc) {
            throw new Error('The doc already exist!');
        }

        if (!AuthorityManager.canDo('create', nextDoc, user.group))
            throw new Error('Cannot create');

        nextDoc.markup = CategoryManager.checkCategory(markup, fullTitle);

        await CategoryManager.categorizeDoc(nextDoc.docId, '', nextDoc.markup);
        await DocManager.createDocByDoc(prevDoc, nextDoc, user, comment);

    }

    static async #editDocByFullTitle(fullTitle: string, user: User, markup: string, comment?: string): Promise<void> {
        const prevDoc = await DocManager.getDocByFullTitle(fullTitle, -1);

        if (!prevDoc || prevDoc.state === 'deleted')
            throw new Error('The doc does not exist!');

        if (!AuthorityManager.canDo('edit', prevDoc, user.group))
            throw new Error('Cannot Write');

        const nextDoc = { ...prevDoc };
        nextDoc.markup = CategoryManager.checkCategory(markup, fullTitle);
        nextDoc.revision += 1;

        await CategoryManager.categorizeDoc(nextDoc.docId, prevDoc.markup, nextDoc.markup);
        await DocManager.editDocByDoc(prevDoc, nextDoc, user, comment);
    }

    static async deleteDocByFullTitle(fullTitle: string, user: User, comment?: string): Promise<void> {
        const prevDoc = await DocManager.getDocByFullTitle(fullTitle);

        if (!prevDoc)
            throw new Error('The document does not exist yet');

        if (!AuthorityManager.canDo('delete', prevDoc, user.group))
            throw new Error('Cannot delete');

        if (prevDoc.type === 'category')
            throw new Error('Cannot delete category docs by force');

        await CategoryManager.categorizeDoc(prevDoc.docId, prevDoc.markup, '');
        await DocManager.deleteDocByDoc(prevDoc, user, comment);
    }

    static async moveDocByFullTitle(fullTitle: string, user: User, newFullTitle: string, comment?: string): Promise<void> {

        const prevDoc = await DocManager.getDocByFullTitle(fullTitle);

        if (!prevDoc)
            throw new Error('The document does not exist yet');

        if (!AuthorityManager.canDo('move', prevDoc, user.group))
            throw new Error('Cannot Move');

        if (prevDoc.type === 'category')
            throw new Error('Cannot move category docs by force');

        if (await InfoController.getInfoByFullTitle(newFullTitle))
            throw new Error(`Doc named "${newFullTitle}" already exist!`)

        await DocManager.moveDocByDoc(prevDoc, newFullTitle, user, comment);
    }

    static async changeAuthorityByFullTitle(fullTitle: string, user: User, action: DocAction, groupArr: Group[], comment: string = ''): Promise<void> {

        for (let group of groupArr) {
            if (!AuthorityManager.isGroup(group))
                throw new Error(`'${group}' is not a group!`);
        }

        const prevDoc = await DocManager.getDocByFullTitle(fullTitle);

        if (!prevDoc)
            throw new Error('The document does not exist yet');

        if (!AuthorityManager.canDo('change_authority', prevDoc, user.group))
            throw new Error('Cannot change authority');

        await DocManager.changeAuthorityByDoc(prevDoc, action, groupArr, user, comment);
    }

    static async changeStateByFullTitle(fullTitle: string, user: User, isAllowed: boolean, comment?: string): Promise<void> {

        const prevDoc = await DocManager.getDocByFullTitle(fullTitle);

        if (prevDoc === null)
            throw new Error('The document does not exist yet');

        if (!AuthorityManager.canDo('change_state', prevDoc, user.group))
            throw new Error('Cannot change state');

        if (!isAllowed) {
            await DocManager.changeStateByDoc(prevDoc, 'forbidden', user, comment);
        } else {
            const prevState = (await LogController.getDocLogsByDocId(prevDoc.docId, prevDoc.revision, prevDoc.revision, 1))[0].systemLog.split('→')[0] as DocState;
            await DocManager.changeStateByDoc(prevDoc, prevState, user, comment);
        }
    }

    static async getDocLogsByFullTitle(
        fullTitle: string,
        user: User,
        fromRev: number,
        toRev = -1
    ): Promise<DocLogDoc[] | null> {
        const doc = await DocManager.getDocByFullTitle(fullTitle, -1);
        if (doc === null)
            return null;

        if (!AuthorityManager.canDo('read', doc, user.group))
            throw new Error('Cannot read doc-logs');

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

        if (fromRev > toRev)
            throw new Error('The range of revision was wrong');

        return await LogController.getDocLogsByDocId(
            doc.docId,
            fromRev,
            toRev
        );
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
