import type { Info } from '../types/info';
import type { Doc, DocId, DocState } from '../types/doc';
import type { Hist } from '../types/hist';
import type { User } from '../types/user';

import InfoController from '../controllers/info';
import HistController from '../controllers/hist';
import CommonController from '../controllers/common';
import LogController from '../controllers/log';

import TitleUtils from '../utils/title';
import GeneralUtils from '../utils/general';

import BacklinkManager from './backlink';

export default class DocManager {

    static createDocByInfoAndUser(info: Info, user: User): Doc {
        const doc: Doc = {
            docId: info.docId,
            type: info.type,
            fullTitle: info.fullTitle,
            authority: info.authority,
            state: info.state,
            categorizedArr: info.categorizedArr,
            revision: info.revision,
            markup: '',
            userEmail: user.email,
            userName: user.name,
            comment: '',
            time: new Date(),
        };
        return doc;
    }

    static createDocByInfoAndHist(info: Info, hist: Hist): Doc {
        const doc: Doc = {
            docId: info.docId,
            type: info.type,
            fullTitle: info.fullTitle,
            authority: info.authority,
            state: info.state,
            categorizedArr: info.categorizedArr,
            revision: hist.revision, // Use hist's revision to manage old version of docs.
            markup: hist.markup,
            userEmail: hist.userEmail,
            userName: hist.userName,
            comment: hist.comment,
            time: hist.time,
        };
        return doc;
    }

    static createNewDocByFullTitle(fullTitle: string, user: User, doc?: Partial<Doc>): Doc {
        const docType = TitleUtils.getDocTypeByFullTitle(fullTitle);
        if (docType === 'general') {
            return this.#createNewGeneralDocByFullTitle(fullTitle, user, doc?.markup, doc?.comment);
        } else if (docType === 'category') {
            return this.#createNewCategoryDocByFullTitle(fullTitle, user, doc?.categorizedArr)
        } else if (docType === 'special') {
            return this.#createNewSpecialDocByFullTitle(fullTitle, user, doc?.markup, doc?.comment);
        } else {
            throw new Error('Unexpected DocType!')
        }
    }

    static #createNewGeneralDocByFullTitle(fullTitle: string, user: User, markup?: string, comment?: string): Doc {
        const docId = GeneralUtils.createNewId() as DocId;
        return {
            docId,
            type: 'general',
            fullTitle,
            authority: {
                read: ['any'],
                write: ['any'],
                move: ['any'],
                delete: ['any'],
                authority: ['manager', 'dev'],
                state: ['manager', 'dev'],
            },
            state: 'new',
            categorizedArr: [],
            revision: 1,
            userEmail: user.email,
            userName: user.name,
            markup: markup || '',
            comment: comment || '',
            time: new Date(),
        };
    }

    static #createNewSpecialDocByFullTitle(fullTitle: string, user: User, markup?: string, comment?: string): Doc {
        const docId = GeneralUtils.createNewId() as DocId;
        return {
            docId,
            type: 'special',
            fullTitle,
            authority: {
                read: ['any'],
                write: ['manager', 'dev'],
                move: ['manager', 'dev'],
                delete: ['manager', 'dev'],
                authority: ['manager', 'dev'],
                state: ['manager', 'dev'],
            },
            state: 'new',
            categorizedArr: [],
            revision: 1,
            userEmail: user.email,
            userName: user.name,
            markup: markup || '',
            comment: comment || '',
            time: new Date(),
        };
    }

    static #createNewCategoryDocByFullTitle(fullTitle: string, user: User, categorizedArr: DocId[] = []): Doc {
        const docId = GeneralUtils.createNewId() as DocId;
        return {
            docId,
            type: 'category',
            fullTitle,
            authority: {
                read: ['any'],
                write: ['any'],
                move: ['system'],
                delete: ['system'],
                authority: ['system', 'manager', 'dev'],
                state: ['system', 'manager', 'dev'],
            },
            state: 'new',
            categorizedArr,
            revision: 1,
            markup: '[#[미분류]]',
            userEmail: user.email,
            userName: user.name,
            comment: '분류 생성',
            time: new Date(),
        };
    }


    static createNextDocByPrevInfo(
        prevInfo: Info,
        user: User,
        markup: string,
        comment?: string,
        state?: DocState,
    ): Doc {
        const nextDoc = this.createDocByInfoAndUser(prevInfo, user);
        nextDoc.revision += 1;
        nextDoc.markup = markup;
        nextDoc.comment = comment || '';
        nextDoc.state = state || nextDoc.state;
        return nextDoc;
    }

    static async getDocByFullTitle(fullTitle: string, revision = -1): Promise<Doc | null> {
        const info = await InfoController.getInfoByFullTitle(fullTitle);
        if (info === null) {
            return null;
        } else {
            const hist = await HistController.getHistByDocId(info.docId, revision);
            if (hist === null) {
                return null;
            } else {
                const doc = this.createDocByInfoAndHist(info, hist);
                return doc;
            }
        }
    }

    static async saveDocByDoc(doc: Doc): Promise<void> {
        const prevDoc = await this.getDocByFullTitle(doc.fullTitle);
        await BacklinkManager.updatelinksByDocs(prevDoc, doc);
        await InfoController.updateInfoByDoc(doc);
        await HistController.setHistByDoc(doc);
    }

    static async setNewDocByDoc(doc: Doc): Promise<void> {
        if (doc.state !== 'new')
            throw new Error("It is not a new document!");
        doc.state = 'normal';
        const parsedComment = doc.comment !== '' ? `<b>[생성]</b> ${doc.comment}` : '<b>[생성]</b>';
        doc.comment = parsedComment;

        await CommonController.addFullTitle(doc.fullTitle);
        await LogController.setWriteLogByDoc(doc);

        await this.saveDocByDoc(doc);

    }

    static async setNextDocByDoc(doc: Doc): Promise<void> {
        await LogController.setWriteLogByDoc(doc);

        await this.saveDocByDoc(doc);
    }

    static async deleteDocByDoc(doc: Doc): Promise<void> {
        const parsedComment = doc.comment !== '' ? `<b>[삭제]</b> ${doc.comment}` : '<b>[삭제]</b>';
        doc.comment = parsedComment;

        await CommonController.removeFullTitle(doc.fullTitle);
        await LogController.setDeleteLogByDoc(doc);

        await this.saveDocByDoc(doc);
    }

    static async setDeletedDocByDoc(doc: Doc): Promise<void> {
        if (doc.state !== 'deleted')
            throw new Error("It is not a deleted document!");
        doc.state = 'normal';
        const parsedComment = doc.comment !== '' ? `<b>[생성]</b> ${doc.comment}` : '<b>[생성]</b>';
        doc.comment = parsedComment;

        await CommonController.addFullTitle(doc.fullTitle);
        await LogController.setWriteLogByDoc(doc);

        await this.saveDocByDoc(doc);
    }

    static async moveDocByInfo(info: Info, user: User, newFullTitle: string, comment?: string): Promise<void> {
        const prevFullTitle = info.fullTitle;
        const moveComment = `<b>[이동|${prevFullTitle}->${newFullTitle}]</b>`
        const parsedComment = (comment && comment !== '') ? `${moveComment} ${comment}` : moveComment;

        info.fullTitle = newFullTitle;
        const movedDoc = this.createDocByInfoAndUser(info, user);
        movedDoc.comment = parsedComment;

        await CommonController.updateFullTitle(prevFullTitle, newFullTitle);
        await LogController.setMoveLogByDoc(movedDoc);

        await InfoController.updateInfoByDoc(movedDoc);
    }

    static async deleteDocByInfo(info: Info, user: User, comment?: string): Promise<void> {
        const doc: Doc = this.createNextDocByPrevInfo(info, user, '', comment||'', 'deleted')
        await this.deleteDocByDoc(doc);
    }
}
