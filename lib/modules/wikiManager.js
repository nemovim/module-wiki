import CategoryManager from './categoryManager';
import DocManager from './docManager';
import InfoManager from './infoManager';
import WikiTranslator from './wikiTranslator';
import HangulSearcher from 'hangul-search';
import AuthorityManager from './authorityManager';
import UserManager from './userManager';
import Diff from 'diff';

export default class WikiManager {
    static async checkInit() {
        const categorizedDoc = await this.readDocByFullTitle('분류:분류', { authority: 1 });
        if (categorizedDoc === null) {
            return false;
        } else {
            return true
        }
    }

    static async firstInit() {
        const uncategorizedDoc = DocManager.createNewCategoryDocByFullTitle(
            '분류:미분류',
            []
        );
        uncategorizedDoc.authorityObj.write = 100;
        uncategorizedDoc.markup = '[#[분류]]';

        const categorizedDoc = DocManager.createNewCategoryDocByFullTitle(
            '분류:분류',
            [uncategorizedDoc.docId]
        );
        categorizedDoc.authorityObj.write = 100;
        categorizedDoc.markup = '';

        return await Promise.allSettled([
            DocManager.setNewDocByDoc(categorizedDoc),
            DocManager.setNewDocByDoc(uncategorizedDoc),
        ]);
    }

    static async createHTML(markup, type, categorizedArr) {
        if (type === 'general') {
            return WikiTranslator.translate(markup);
        } else if (type === 'category') {
            const categoryMarkup =
                await CategoryManager.createCategoryMarkupByCategorizedArr(
                    categorizedArr
                );
            return WikiTranslator.translate(markup + categoryMarkup);
        }
    }

    static async readDocByFullTitle(fullTitle, user, revision = -1) {
        const doc = await DocManager.getDocByFullTitle(fullTitle, revision);
        if (doc === null) {
            return null;
        } else {
            if (AuthorityManager.canRead(doc, user.authority)) {
                doc.html = await this.createHTML(
                    doc.markup,
                    doc.type,
                    doc.categorizedArr
                );
                return doc;
            } else {
                throw new Error('Cannot Read');
            }
        }
    }

    static translateMakrupToHTML(markup) {
        return WikiTranslator.translate(markup);
    }

    static async writeDocByFullTitle(fullTitle, user, markup, comment) {
        const prevDoc = await DocManager.getDocByFullTitle(fullTitle, user, -1);
        if (AuthorityManager.canWrite(prevDoc, user.authority)) {
            if (prevDoc === null) {
                // write new doc
                const newDoc = DocManager.createNewGeneralDocByFullTitle(
                    fullTitle,
                    user,
                    markup,
                    comment
                );

                await CategoryManager.categorizeDoc(prevDoc, newDoc);
                return await DocManager.setNewDocByDoc(newDoc);
            } else {
                // write nextDoc
                const nextDoc = DocManager.createNextDocByPrevDoc(
                    prevDoc,
                    user,
                    markup,
                    comment
                );

                await CategoryManager.categorizeDoc(prevDoc, nextDoc);
                return await DocManager.setNextDocByDoc(nextDoc);
            }
        } else {
            throw new Error('Cannot Write');
        }
    }

    static async compareDocByFullTitle(fullTitle, user, oldRev, newRev) {
        const result = await Promise.allSettled([
            this.readDocByFullTitle(fullTitle, user, oldRev),
            this.readDocByFullTitle(fullTitle, user, newRev),
        ]);
        const oldDoc = result[0].value;
        const newDoc = result[1].value;
        return Diff.diffWords(oldDoc.markup, newDoc.markup);
    }

    static async searchDoc(searchWord) {
        const infoArr = await InfoManager.getAllInfos();
        let hangulSearcher = new HangulSearcher(infoArr);
        let searchResultArr = hangulSearcher.search(searchWord, 0.2);
        if (
            searchResultArr.length !== 0 &&
            searchWord === searchResultArr[0].title
        ) {
            // Exact match
            return {
                status: 'exact',
                result: searchWord,
            };
        } else {
            return {
                status: 'search',
                result: searchResultArr,
            };
        }
    }

    static async getUserByEmail(email) {
        return await UserManager.getUserByEmail(email);
    }

    static async createNewUserByEmailAndName(email, name) {
        return await UserManager.setUserByEmailAndName(email, name);
    }
}
