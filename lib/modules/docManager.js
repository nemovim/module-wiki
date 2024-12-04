import InfoManager from './infoManager';
import HistManager from './histManager';
import CommonManager from './commonManager.js';
import Utils from './utils';
import LogManager from './logManager';

export default class DocManager {
    static createDocByInfo(
        info,
        user = { name: 'anonymous' },
        markup = '',
        comment = ''
    ) {
        const doc = {
            docId: info.docId,
            type: info.type,
            fullTitle: info.fullTitle,
            authorityObj: info.authorityObj,
            state: info.state,
            categorizedArr: info.categorizedArr,
            revision: info.revision,
            markup: markup,
            author: user.author,
            comment: comment,
            time: -1,
        };
        return doc;
    }

    static createDocByInfoAndHist(info, hist) {
        const doc = {
            docId: info.docId,
            type: info.type,
            fullTitle: info.fullTitle,
            authorityObj: info.authorityObj,
            state: info.state,
            categorizedArr: info.categorizedArr,
            revision: hist.revision,
            markup: hist.markup,
            author: hist.author,
            comment: hist.comment,
            time: hist.createdAt,
        };
        return doc;
    }

    static createNewGeneralDocByFullTitle(fullTitle, user, markup, comment) {
        const docId = Utils.createNewDocId();
        return {
            docId,
            type: 'general',
            fullTitle,
            authorityObj: {
                read: 1,
                write: 1,
                update: 1,
                delete: 1,
            },
            state: 'normal',
            categorizedArr: [],
            revision: 1,
            markup,
            author: user.name,
            comment,
        };
    }

    static createNewCategoryDocByFullTitle(fullTitle, categorizedArr) {
        const docId = Utils.createNewDocId();
        return {
            docId,
            type: 'category',
            fullTitle,
            authorityObj: {
                read: 1,
                write: 1,
                update: 100,
                delete: 100,
            },
            state: 'normal',
            categorizedArr,
            revision: 1,
            markup: '[#[미분류]]',
            author: 'system',
            comment: '분류 생성',
        };
    }

    static createNextDocByPrevDoc(
        prevDoc,
        user,
        markup,
        comment,
        state = 'normal'
    ) {
        const nextDoc = { ...prevDoc };
        nextDoc.revision += 1;
        nextDoc.markup = markup;
        nextDoc.comment = comment;
        nextDoc.author = user.name;
        nextDoc.time = -1;
        nextDoc.state = state;
        return nextDoc;
    }

    static async getDocByFullTitle(fullTitle, revision = -1) {
        const info = await InfoManager.getInfoByFullTitle(fullTitle);
        if (info === null) {
            return null;
        } else {
            const hist = await HistManager.getHistByDocId(info.docId, revision);
            if (hist === null) {
                return null;
            } else {
                const doc = this.createDocByInfoAndHist(info, hist);
                return doc;
            }
        }
    }

    static async setNewDocByDoc(doc) {
        return await Promise.allSettled([
            InfoManager.setInfoByDoc(doc),
            HistManager.setHistByDoc(doc),
            CommonManager.addFullTitle(doc.fullTitle),
            LogManager.setWriteLogByDoc(doc),
        ]);
    }

    static async setNextDocByDoc(doc) {
        return await Promise.allSettled([
            InfoManager.updateInfoByDoc(doc),
            HistManager.setHistByDoc(doc),
            LogManager.setWriteLogByDoc(doc),
        ]);
    }

    static async deleteDocByDoc(doc) {
        return await Promise.allSettled([
            InfoManager.updateInfoByDoc(doc),
            HistManager.setHistByDoc(doc),
            CommonManager.removeFullTitle(doc.fullTitle),
            LogManager.setDeleteLogByDoc(doc),
        ]);
    }

    static async setDeletedDocByDoc(doc) {
        return await Promise.allSettled([
            InfoManager.updateInfoByDoc(doc),
            HistManager.setHistByDoc(doc),
            CommonManager.addFullTitle(doc.fullTitle),
            LogManager.setWriteLogByDoc(doc),
        ]);
    }
}
