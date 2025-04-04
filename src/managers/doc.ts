import type { Info } from '../types/info';
import type { Doc, DocId, DocState } from '../types/doc';
import type { DocAction } from '../types/log';
import type { Hist } from '../types/hist';
import type { User } from '../types/user';
import type { Group } from '../types/authority';

import InfoController from '../controllers/info.js';
import HistController from '../controllers/hist.js';
import CommonController from '../controllers/common.js';
import LogController from '../controllers/log.js';

import BacklinkManager from './backlink.js';

import TitleUtils from '../utils/title.js';
import GeneralUtils from '../utils/general.js';


export default class DocManager {

    static createDocByInfoAndHist(info: Info, hist: Hist): Doc {
        return {
            docId: info.docId,
            type: info.type,
            fullTitle: info.fullTitle,
            authority: info.authority,
            state: info.state,
            categorizedArr: info.categorizedArr,
            revision: hist.revision, // Use hist's revision to manage old version of docs.
            markup: hist.markup,
        };
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

    static createNewEmptyDocByFullTitle(fullTitle: string): Doc {
        const docType = TitleUtils.getDocTypeByFullTitle(fullTitle);
        if (docType === 'general') {
            return this.#createNewGeneralDocByFullTitle(fullTitle);
        } else if (docType === 'category') {
            return this.#createNewCategoryDocByFullTitle(fullTitle);
        } else if (docType === 'special') {
            return this.#createNewSpecialDocByFullTitle(fullTitle);
        } else {
            throw new Error('Unexpected DocType!')
        }
    }

    static #createNewGeneralDocByFullTitle(fullTitle: string): Doc {
        const docId = GeneralUtils.createNewId() as DocId;
        return {
            docId,
            type: 'general',
            fullTitle,
            authority: {
                read: ['any'],
                create: ['any'],
                edit: ['any'],
                move: ['any'],
                delete: ['any'],
                change_authority: ['manager', 'dev'],
                change_state: ['manager', 'dev'],
            },
            state: 'new',
            categorizedArr: [],
            revision: 1,
            markup: '',
        };
    }

    static #createNewSpecialDocByFullTitle(fullTitle: string): Doc {
        const docId = GeneralUtils.createNewId() as DocId;
        return {
            docId,
            type: 'special',
            fullTitle,
            authority: {
                read: ['any'],
                create: ['manager', 'dev'],
                edit: ['manager', 'dev'],
                move: ['manager', 'dev'],
                delete: ['manager', 'dev'],
                change_authority: ['manager', 'dev'],
                change_state: ['manager', 'dev'],
            },
            state: 'new',
            categorizedArr: [],
            revision: 1,
            markup: '',
        };
    }

    static #createNewCategoryDocByFullTitle(fullTitle: string): Doc {
        const docId = GeneralUtils.createNewId() as DocId;
        return {
            docId,
            type: 'category',
            fullTitle,
            authority: {
                read: ['any'],
                create: ['none'],
                edit: ['any'],
                move: ['none'],
                delete: ['none'],
                change_authority: ['manager', 'dev'],
                change_state: ['manager', 'dev'],
            },
            state: 'new',
            categorizedArr: [],
            revision: 1,
            markup: '[#[미분류]]',
        };
    }

    static async saveDocByDoc(prevDoc: Doc | null, nextDoc: Doc): Promise<void> {
        await BacklinkManager.updatelinksByDocs(prevDoc, nextDoc);
        await InfoController.updateInfoByDoc(nextDoc);
        await HistController.setHistByDoc(nextDoc);
    }

    static async createDocByDoc(prevDoc: Doc | null, nextDoc: Doc, user: User, comment?: string): Promise<void> {
        nextDoc.state = 'normal';
        await CommonController.addFullTitle(nextDoc.fullTitle);
        await LogController.setDocLogByAction('create', prevDoc, nextDoc, user, comment);
        await this.saveDocByDoc(prevDoc, nextDoc);
    }

    static async editDocByDoc(prevDoc: Doc, nextDoc: Doc, user: User, comment?: string): Promise<void> {
        await LogController.setDocLogByAction('edit', prevDoc, nextDoc, user, comment);
        await this.saveDocByDoc(prevDoc, nextDoc);
    }

    static async deleteDocByDoc(prevDoc: Doc, user: User, comment?: string): Promise<void> {
        const nextDoc = { ...prevDoc };
        nextDoc.state = 'deleted';
        nextDoc.markup = '';
        nextDoc.categorizedArr = [];
        nextDoc.revision += 1;

        await CommonController.removeFullTitle(nextDoc.fullTitle);
        await LogController.setDocLogByAction('delete', prevDoc, nextDoc, user, comment);
        await this.saveDocByDoc(prevDoc, nextDoc);
    }

    static async moveDocByDoc(prevDoc: Doc, newFullTitle: string, user: User, comment?: string): Promise<void> {
        const nextDoc = { ...prevDoc }
        nextDoc.fullTitle = newFullTitle;
        await CommonController.updateFullTitle(prevDoc.fullTitle, nextDoc.fullTitle);
        await LogController.setDocLogByAction('move', prevDoc, nextDoc, user, comment);
        await LogController.updateFullTitlesOfAllDocLogsByDocId(nextDoc.docId, nextDoc.fullTitle);
        await InfoController.updateInfoByDoc(nextDoc);
    }

    static async changeAuthorityByDoc(prevDoc: Doc, action: DocAction, groupArr: Group[], user: User, comment?: string): Promise<void> {
        const nextDoc = { ...prevDoc }
        nextDoc.authority[action] = groupArr;
        await LogController.setDocLogByAction('change_authority', prevDoc, nextDoc, user, comment);
        await InfoController.updateInfoByDoc(nextDoc);
    }

    static async changeStateByDoc(prevDoc: Doc, newState: DocState, user: User, comment?: string): Promise<void> {
        const nextDoc = { ...prevDoc }
        nextDoc.state = newState;
        await LogController.setDocLogByAction('change_state', prevDoc, nextDoc, user, comment);
        await InfoController.updateInfoByDoc(nextDoc);
    }

}
