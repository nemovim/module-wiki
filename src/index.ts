import type { Info } from './types/info';
import type { Doc } from './types/doc';
import type { User, UserEmail, UserName } from './types/user';
import type { DocAction, DocLog, DocLogDoc } from './types/log';
import type { Group } from './types/authority';
import type { PenaltyDoc, PenaltyId } from './types/penalty';

import type { Change } from 'diff';
import type { SearchResult } from 'hangul-searcher';

// import xss from 'xss';
import mongoose from 'mongoose';

import DBManager from './managers/db.js';
import WikiManager from './managers/wiki.js';
import AuthorityManager from './managers/authority.js';
import DocManager from './managers/doc.js';
import BacklinkManager from './managers/backlink.js';
import PenaltyManager from './managers/penalty.js';
import UserManager from './managers/user.js';

import LogController from './controllers/log.js';
import UserController from './controllers/user.js';
import CommonController from './controllers/common.js';

import TitleUtils from './utils/title.js';
import WikiTranslator from './utils/translator.js';
import GeneralUtils from './utils/general.js';

// ================ Initialization ================
export async function activateWiki(MONGO_URI: string): Promise<boolean> {
    WikiTranslator.initTranslator();
    await DBManager.init(MONGO_URI);
    if (!(await WikiManager.isInitialized())) {
        await mongoose.connection.transaction(async () => {
            await CommonController.initCommon();
            const systemUser = AuthorityManager.getSystemUser();
            const systemUserDoc = await UserManager.signupUserByEmailAndName(systemUser.email, systemUser.name);
            systemUserDoc.group = 'system';
            await systemUserDoc.save();
            // await UserManager.changeGroupByEmail(systemUser.email, 'system', systemUser);
            await WikiManager.init();
        });
    }
    return true;
}

// ================ User Module  ================

export async function getUserByEmail(email: string): Promise<User | null> {
    return await UserController.getUserByEmail(email as UserEmail);
}

export async function getUserByName(name: string): Promise<User | null> {
    return await UserController.getUserByName(name as UserName);
}

export async function signinUserByEmail(email: string): Promise<User | null> {
    return await mongoose.connection.transaction(async () => {
        return await UserManager.signinUserByEmail(email as UserEmail);
    });
}

export async function signupUserByEmailAndName(email: string, name: string): Promise<User> {
    return await mongoose.connection.transaction(async () => {
        return await UserManager.signupUserByEmailAndName(email as UserEmail, name as UserName);
    });
}

export async function changeUserNameByName(userName: string, name: string, operator: User): Promise<User> {
    return await mongoose.connection.transaction(async () => {
        return await UserManager.changeNameByName(userName as UserName, name as UserName, operator);
    });
}

export async function changeUserGroupByName(userName: string, group: Group, operator: User): Promise<User> {
    return await mongoose.connection.transaction(async () => {
        return await UserManager.changeGroupByName(userName as UserName, group, operator);
    });
}

export async function removeUserByEmail(email: string): Promise<boolean> {
    return await mongoose.connection.transaction(async () => {
        await UserManager.removeUserByEmail(email as UserEmail);
        return true;
    });
}

export async function refreshAndGetPenaltiesByName(penalizedName: string): Promise<PenaltyDoc[]> {
    return await mongoose.connection.transaction(async () => {
        return await PenaltyManager.refreshPenaltiesByName(penalizedName as UserName);
    });
}

export async function warnUserByName(penalizedName: string, penalizer: User, duration: number, comment = ''): Promise<boolean> {
    comment = GeneralUtils.ignoreHtml(comment);
    return await mongoose.connection.transaction(async () => {
        await PenaltyManager.warnUserByName(penalizedName as UserName, duration, comment, penalizer);
        return true;
    });
}

export async function blockUserByName(penalizedName: string, penalizer: User, duration: number, comment = ''): Promise<boolean> {
    comment = GeneralUtils.ignoreHtml(comment);
    return await mongoose.connection.transaction(async () => {
        await PenaltyManager.blockUserByName(penalizedName as UserName, duration, comment, penalizer);
        return true;
    });
}

export async function removePenaltyById(penaltyId: PenaltyId, comment: string, penalizer: User): Promise<boolean> {
    comment = GeneralUtils.ignoreHtml(comment);
    return await mongoose.connection.transaction(async () => {
        await PenaltyManager.removePenaltyById(penaltyId, comment, penalizer);
        return true;
    });
}

// ================ Doc Module ================
export function createNewDocByFullTitle(fullTitle: string): Doc {
    return DocManager.createNewEmptyDocByFullTitle(fullTitle);
}

export async function readDocByFullTitle(fullTitle: string, user: User, revision = -1): Promise<Doc | null> {
    return await WikiManager.readDocByFullTitle(fullTitle, user, revision);
}

export async function writeDocByFullTitle(fullTitle: string, user: User, markup: string, comment: string = ''): Promise<boolean> {
    comment = GeneralUtils.ignoreHtml(comment);
    return await mongoose.connection.transaction(async () => {
        await WikiManager.writeDocByFullTitle(fullTitle, user, markup, comment);
        return true;
    });
}

export async function moveDocByFullTitle(fullTitle: string, user: User, newFullTitle: string, comment: string = ''): Promise<boolean> {
    comment = GeneralUtils.ignoreHtml(comment);
    return await mongoose.connection.transaction(async () => {
        await WikiManager.moveDocByFullTitle(fullTitle, user, newFullTitle, comment);
        return true;
    });
}

export async function updateAuthorityByFullTitle(fullTitle: string, user: User, action: DocAction, groupArr: Group[], comment=''): Promise<boolean> {
    comment = GeneralUtils.ignoreHtml(comment);
    return await mongoose.connection.transaction(async () => {
        await WikiManager.changeAuthorityByFullTitle(fullTitle, user, action, groupArr, comment);
        return true;
    });
}

export async function updateStateByFullTitle(fullTitle: string, user: User, isAllowed: boolean, comment=''): Promise<boolean> {
    comment = GeneralUtils.ignoreHtml(comment);
    return await mongoose.connection.transaction(async () => {
        await WikiManager.changeStateByFullTitle(fullTitle, user, isAllowed, comment);
        return true;
    });
}

export async function deleteDocByFullTitle(fullTitle: string, user: User, comment: string = ''): Promise<boolean> {
    comment = GeneralUtils.ignoreHtml(comment);
    return await mongoose.connection.transaction(async () => {
        await WikiManager.deleteDocByFullTitle(fullTitle, user, comment);
        return true;
    });
}

// ================ Other Doc Modules ================
export async function compareDocByFullTitle(fullTitle: string, user: User, oldRev: number, newRev: number): Promise<{ diff: Change[], oldDoc: Doc | null, newDoc: Doc | null }> {
    return await WikiManager.compareDocByFullTitle(fullTitle, user, oldRev, newRev);
}

export async function searchDoc(searchWord: string): Promise<{ status: 'exact' | 'searched', result: Array<string | SearchResult> }> {
    return await WikiManager.searchDoc(searchWord);
}

export async function previewDoc(doc: Doc): Promise<string> {
    return await WikiManager.createHTMLByDoc(doc)
}


// ================ History Module ================
export async function getDocLogsByFullTitle(fullTitle: string, user: User, fromRev: number, toRev: number = -1): Promise<DocLogDoc[] | null> {
    return await WikiManager.getDocLogsByFullTitle(fullTitle, user, fromRev, toRev);
}

export async function getDocLogsByUserName(userName: string, cnt=20): Promise<DocLogDoc[]> {
    return await LogController.getDocLogsByUserName(userName as UserName, cnt);
}


// ================ Log Module ================
export async function getRecentWriteLogs(count: number = 10): Promise<Array<DocLog>> {
    return await LogController.getRecentWriteLogs(count);
}


// ================ Other Utils ================
export function canDo(action: DocAction, docInfo: Info, userGroup: Group): boolean {
    return AuthorityManager.canDo(action, docInfo, userGroup);
}

export async function getAllFullTitles(): Promise<string[]> {
    return await CommonController.getAllFullTitles();
}

export function encodeFullTitle(fullTitle: string): string {
    return TitleUtils.encodeFullTitle(fullTitle);
}

export function decodeFullTitle(fullTitle: string): string {
    return TitleUtils.decodeFullTitle(fullTitle);
}

export async function createBacklinkHtmlByFullTitle(fullTitle: string): Promise<string | null> {
    const markup = await BacklinkManager.createBacklinkMarkupByFullTitle(fullTitle);
    if (!markup)
        return null;
    return WikiTranslator.translate(markup);
}

// export function translateMarkup(markup: string, fullTitle: string): string {
//     markup = xss(markup.replaceAll(/\r\n/g, '\n'));
//     return WikiTranslator.translate(markup, fullTitle);
// }

// ================ Types ================
export type * from './types/authority';
export type * from './types/backlink';
export type * from './types/common';
export type * from './types/doc';
export type * from './types/hist';
export type * from './types/info';
export type * from './types/log';
export type * from './types/penalty';
export type * from './types/user';
export type { SearchResult } from 'hangul-searcher';