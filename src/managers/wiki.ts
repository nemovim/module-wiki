import type { Doc } from '../types/doc';
import type { Group } from '../types/authority';
import type { User } from '../types/user';
import type { DocAction } from '../types/log';

import HangulSearcher, { type SearchResult } from 'hangul-searcher';
import { type Change, diffWords } from 'diff';

import InfoController from '../controllers/info.js';
import MappingController from '../controllers/mapping.js';

import AuthorityManager from './authority.js';
import CategoryManager from './category.js';
import DocManager from './doc.js';

import WikiTranslator from '../utils/translator.js';
import TitleUtils from '../utils/title.js';
import FileManager from './file.js';

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
        if (!(doc.type === 'general' || doc.type === 'wiki' || doc.type === 'file' || doc.type === 'category')) {
            throw new Error('Undexpected DocType or hidden doc');
        }

        let categoryMarkup = '';

        if (doc.type === 'category') {
            categoryMarkup =
                await CategoryManager.createCategoryMarkupByCategorizedArr(
                    doc.categorizedArr || []
                );
        }

        let fileMarkup = '';

        if (doc.type === 'file') {
            fileMarkup = `[@[${TitleUtils.getPrefixAndTitleByFullTitle(doc.fullTitle)[1]}]]\n`;
        }

        const fileTitleArr = WikiTranslator.getFileTitleArr(fileMarkup + doc.markup);
        const filePathArr = await FileManager.getFilePathsByTitleArr(fileTitleArr);

        return WikiTranslator.translate(fileMarkup + doc.markup + categoryMarkup, doc.fullTitle, filePathArr);
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

        if (!prevDoc || prevDoc?.state === 'deleted') {
            await this.#createDocByFullTitle(fullTitle, user, markup, comment);
        } else if (prevDoc) {
            await this.#editDocByFullTitle(fullTitle, user, markup, comment);
        }
    }

    static async #createDocByFullTitle(fullTitle: string, user: User, markup: string, comment?: string, file?: File): Promise<void> {
        if (TitleUtils.getPrefixAndTitleByFullTitle(fullTitle)[0] === '위키' && !AuthorityManager.canCreateWiki(user.group))
            throw new Error('Cannot create wiki doc');

        if (TitleUtils.getPrefixAndTitleByFullTitle(fullTitle)[1] === '')
            throw new Error('The title must not be empty!');

        const prevDoc = await DocManager.getDocByFullTitle(fullTitle, -1);
        const nextDoc = DocManager.createNewEmptyDocByFullTitle(fullTitle);

        if (prevDoc && prevDoc.state === 'deleted') {
            nextDoc.authority = prevDoc.authority;
            nextDoc.docId = prevDoc.docId;
            nextDoc.revision = prevDoc.revision + 1;
        } else if (prevDoc) {
            throw new Error('The doc already exist!');
        }

        if (!AuthorityManager.canDo('create', nextDoc, user.group) && !file)
            throw new Error('Cannot create');

        if (file) {
            const fileKey = await FileManager.uploadFileToStorage(file);
            nextDoc.fileKey = fileKey;
        }

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

        await DocManager.editDocByDoc(prevDoc, markup, user, comment);
    }

    static async deleteDocByFullTitle(fullTitle: string, user: User, comment?: string): Promise<void> {
        const prevDoc = await DocManager.getDocByFullTitle(fullTitle);

        if (!prevDoc)
            throw new Error('The document does not exist yet');

        if (!AuthorityManager.canDo('delete', prevDoc, user.group))
            throw new Error('Cannot delete');

        if (prevDoc.type === 'category')
            throw new Error('Cannot delete category docs by force');

        console.log(fullTitle)
        console.log(prevDoc.type)
        console.log(prevDoc.fileKey)

        if (prevDoc.type === 'file') {
            await FileManager.deleteFileFromStorage(prevDoc.fileKey as string);
        }

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

        const [newPrefix, newTitle] = TitleUtils.getPrefixAndTitleByFullTitle(newFullTitle);
        const [oldPrefix, oldTitle] = TitleUtils.getPrefixAndTitleByFullTitle(fullTitle);
    
        if (newTitle === '')
            throw new Error('The new title must not be empty!');

        if (newPrefix !== oldPrefix)
            throw new Error('The prefix cannot be changed!');

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

    static async hideDocByFullTitle(fullTitle: string, user: User, comment?: string): Promise<void> {
        const prevDoc = await DocManager.getDocByFullTitle(fullTitle);

        if (prevDoc === null)
            throw new Error('The document does not exist yet');

        if (!AuthorityManager.canDo('change_state', prevDoc, user.group))
            throw new Error('Cannot hide doc');

        if (prevDoc.state === 'hidden')
            throw new Error('The doc is already hidden');

        if (prevDoc.state === 'normal')
            throw new Error('The doc must be deleted before hiding');

        await DocManager.hideDocByDoc(prevDoc, user, comment);
    }

    static async showDocByFullTitle(fullTitle: string, user: User, comment?: string): Promise<void> {
        const prevDoc = await DocManager.getDocByFullTitle(fullTitle);

        if (prevDoc === null)
            throw new Error('The document does not exist yet');

        if (!AuthorityManager.canDo('change_state', prevDoc, user.group))
            throw new Error('Cannot show doc');

        if (prevDoc.state !== 'hidden')
            throw new Error('The doc is not hidden');

        await DocManager.showDocByDoc(prevDoc, user, comment);
    }

    static async uploadFileByFullTitle(fullTitle: string, file: File, markup: string, user: User, comment?: string): Promise<void> {
        const [prefix, title] = TitleUtils.getPrefixAndTitleByFullTitle(fullTitle);
        if (prefix !== '파일') throw new Error('The prefix of the file must be "파일"!');

        await this.#createDocByFullTitle(fullTitle, user, markup, comment, file);
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
        const fullTitleArr = (await MappingController.getAllFullTitles());
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
