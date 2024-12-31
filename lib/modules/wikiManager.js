import CategoryManager from './categoryManager.js';
import DocManager from './docManager.js';
import InfoManager from './infoManager.js';
import WikiTranslator from './wikiTranslator.js';
import HangulSearcher from 'hangul-searcher';
import AuthorityManager from './authorityManager.js';
import UserManager from './userManager.js';
import CommonManager from './commonManager.js';
import LogManager from './logManager.js';
import HistManager from './histManager.js';
import { diffWords } from 'diff';
import xss from 'xss';

export default class WikiManager {
    static async checkInit() {
        // WikiTranslator.overrideAnchorLinkParser();

        const categorizedDoc = await this.readDocByFullTitle('분류:분류', {
            authority: 1,
        });
        if (categorizedDoc === null) {
            return false;
        } else {
            return true;
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

        await CommonManager.initCommon();

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
        } else if (AuthorityManager.canRead(doc, user.authority)) {
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

    static async readHistoriesByFullTitle(
        fullTitle,
        user,
        fromRev,
        toRev = -1
    ) {
        const doc = await DocManager.getDocByFullTitle(fullTitle, -1);
        if (doc === null) {
            return null;
        } else if (AuthorityManager.canRead(doc, user.authority)) {
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
                return await HistManager.getHistsByDocId(
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

    static async writeDocByFullTitle(fullTitle, user, markup, comment) {
        markup = xss(markup);
        const prevDoc = await DocManager.getDocByFullTitle(fullTitle, -1);
        if (prevDoc === null) {
            // write new doc
            if (fullTitle.split(':')[0] === '분류') {
                throw new Error('Cannot Create a category doc by force!');
            } else {
                if (fullTitle.split(':')[0] === '위키') {
                    if (!AuthorityManager.canWriteNewWiki(user.authority)) {
                        throw new Error('Cannot Write Wiki Doc');
                    }
                }
                const newDoc = DocManager.createNewGeneralDocByFullTitle(
                    fullTitle,
                    user,
                    markup,
                    comment
                );

                await CategoryManager.categorizeDoc(prevDoc, newDoc);
                return await DocManager.setNewDocByDoc(newDoc);
            }
        } else if (AuthorityManager.canWrite(prevDoc, user.authority)) {
            // write nextDoc
            const nextDoc = DocManager.createNextDocByPrevDoc(
                prevDoc,
                user,
                markup,
                comment,
                'normal'
            );

            await CategoryManager.categorizeDoc(prevDoc, nextDoc);

            if (prevDoc.state === 'deleted') {
                return await DocManager.setDeletedDocByDoc(nextDoc);
            } else {
                return await DocManager.setNextDocByDoc(nextDoc);
            }
        } else {
            throw new Error('Cannot Write');
        }
    }

    static async updateDocByFullTitle(fullTitle, user, newInfo) {
        const prevDoc = await DocManager.getDocByFullTitle(fullTitle, -1);
        if (prevDoc === null) {
            throw new Error('The document does not exist yet');
        } else if (
            newInfo.authorityObj !== undefined &&
            AuthorityManager.canUpdateAuthority(user.authority)
        ) {
            prevDoc.authorityObj = newInfo.authorityObj;
            return await InfoManager.updateInfoByDoc(prevDoc);
        } else if (
            newInfo.authorityObj === undefined &&
            AuthorityManager.canUpdate(prevDoc, user.authority) &&
            prevDoc.type != 'category'
        ) {
            if (newInfo.fullTitle !== undefined) {
                prevDoc.fullTitle = newInfo.fullTitle;
            }

            if (newInfo.state !== undefined) {
                prevDoc.state = newInfo.state;
            }

            return await Promise.allSettled([
                InfoManager.updateInfoByDoc(prevDoc),
                CommonManager.updateFullTitle(fullTitle, prevDoc.fullTitle),
            ]);
        } else {
            throw new Error('Cannot Update');
        }
    }

    static async deleteDocByFullTitle(fullTitle, user, comment) {
        const prevDoc = await DocManager.getDocByFullTitle(fullTitle, -1);
        if (prevDoc === null) {
            throw new Error('The document does not exist yet');
        } else if (
            AuthorityManager.canDelete(prevDoc, user.authority) &&
            prevDoc.type != 'category'
        ) {
            const nextDoc = DocManager.createNextDocByPrevDoc(
                prevDoc,
                user,
                '',
                '문서 삭제: ' + comment,
                'deleted'
            );

            await CategoryManager.categorizeDoc(prevDoc, nextDoc, true);
            return await DocManager.deleteDocByDoc(nextDoc);
        } else {
            throw new Error('Cannot Delete');
        }
    }

    static async compareDocByFullTitle(fullTitle, user, oldRev, newRev) {
        const result = await Promise.allSettled([
            this.readDocByFullTitle(fullTitle, user, oldRev),
            this.readDocByFullTitle(fullTitle, user, newRev),
        ]);
        const oldDoc = result[0].value;
        const newDoc = result[1].value;
        return {
            diff: diffWords(oldDoc.markup, newDoc.markup),
            oldDoc,
            newDoc,
        };
    }

    static async searchDoc(searchWord) {
        const infoArr = await CommonManager.getFullTitleArr();
        const hangulSearcher = new HangulSearcher(infoArr);
        const searchResultArr = hangulSearcher.search(searchWord);
        if (searchResultArr.length !== 0 && searchResultArr[0] === searchWord) {
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

    static async getFullTitleArr() {
        return await CommonManager.getFullTitleArr();
    }

    static async getRecentWriteLogs(count = 10) {
        return await LogManager.getRecentWriteLogs(count);
    }
}
