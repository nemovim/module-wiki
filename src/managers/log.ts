import type { Doc } from '../types/doc';
import type { DocAction, UserAction, DocLogDoc, DocLog, UserLogDoc, PenaltyLog, PenaltyAction, PenaltyLogDoc } from '../types/log';
import type { Penalty } from '../types/penalty';
import type { User, UserEmail, UserName } from '../types/user';

import UserController from '../controllers/user.js';
import MetaController from '../controllers/meta.js';
import LogController from '../controllers/log.js';

import DocManager from './doc.js';
import AuthorityManager from './authority.js';

import GeneralUtils from '../utils/general.js';

export default class LogManager {

    static #makeSystemLogByDocAction(action: DocAction, prevDoc: Doc | null, nextDoc: Doc): string {
        if (action === 'create' && nextDoc.type === 'category')
            return '[분류 생성]';
        else if (action === 'delete' && nextDoc.type === 'category')
            return '[분류 삭제]';
        else if (action === 'delete' && nextDoc.type !== 'category')
            return ''; // return '[삭제]';
        else if (action === 'move')
            return `${prevDoc?.fullTitle || ''}→${nextDoc.fullTitle}`;
        else if (action === 'change_authority'){
            if (!prevDoc?.authority)
                throw new Error("The authority of prevDoc must exist!")

            return (Object.keys(nextDoc.authority) as DocAction[]).reduce((prev: string, docAction: DocAction) => {
                const prevAuthority = prevDoc.authority[docAction] || [];
                const nextAuthority = nextDoc.authority[docAction] || [];
                if (!GeneralUtils.isSameArr(prevAuthority, nextAuthority))
                    return `[${docAction}]: (${prevAuthority})→(${nextAuthority})`
                else
                    return prev;
            }, '');
        } else if (action === 'change_state') {
            if (nextDoc.state === 'hidden')
                return `[숨김]`;
            else if (nextDoc.state === 'deleted')
                return `[숨김 해제]`;
            else
                throw new Error("The state of next doc must be either 'hidden' or 'deleted'!")
        }
        else
            return '';
    }

    static async setDocLogByAction(action: DocAction, prevDoc: Doc | null, nextDoc: Doc, user: User, comment?: string): Promise<DocLogDoc> {

        const userDoc = await UserController.getUserByEmail(user.email);
        if (!userDoc)
            throw new Error('The user does not exist!')
        await UserController.addContribCntByUserName(userDoc.name, 1);

        const delta = GeneralUtils.calcByte(nextDoc.markup) - GeneralUtils.calcByte(prevDoc?.markup || '');

        const systemLog = this.#makeSystemLogByDocAction(action, prevDoc, nextDoc);

        await MetaController.addContribCnt(1);

        const docLog: DocLog = {
            docId: nextDoc.docId,
            fullTitle: nextDoc.fullTitle,
            revision: nextDoc.revision,
            delta,
            userEmail: user.email,
            userName: user.name,
            comment: comment || '',
            systemLog,
            action,
            time: new Date(),
        }

        return await LogController.setDocLogByDocLog(docLog);
    }

    static async setUserLogByEmailAndAction(email: UserEmail, action: UserAction, systemLog?: string): Promise<UserLogDoc> {
        const userLog = {
            action,
            userEmail: email,
            systemLog: systemLog || '',
            time: new Date(),
        };
        return await LogController.setUserLogByUserLog(userLog);
    }

    static async setPenaltyLogByPenaltyAndAction(penalty: Penalty, action: PenaltyAction): Promise<PenaltyLogDoc> {
        const penaltyLog: PenaltyLog = {
            action,
            penaltyType: penalty.type,
            userEmail: penalty.penalizerEmail,
            penalizedEmail: penalty.penalizedEmail,
            duration: penalty.duration,
            comment: penalty.comment,
            time: new Date(),
        };
        return await LogController.setPenaltyLogByPenaltyLog(penaltyLog);
    }

    static async getDocLogsByFullTitle(
        fullTitle: string,
        user: User,
        page: number,
        cnt = 10,
    ): Promise<DocLogDoc[] | null> {
        if (cnt <= 0)
            throw new Error('The cnt cannot be less than or equal to zero!');

        const doc = await DocManager.getDocByFullTitle(fullTitle, -1);
        if (doc === null)
            return null;

        if (!AuthorityManager.canDo('read', doc, user.group))
            throw new Error('Cannot read doc-logs');

        const skip = (page - 1) * cnt;
        const limit = cnt;

        return await LogController.getDocLogsByDocId(
            doc.docId,
            limit,
            skip
        );
    }

    static async getDocLogsByUserName(
        userName: UserName,
        page: number,
        cnt = 10,
    ): Promise<DocLogDoc[] | null> {
        if (cnt <= 0)
            throw new Error('The cnt cannot be less than or equal to zero!');

        const user = await UserController.getUserByName(userName);
        if (user === null)
            return null;

        const skip = (page - 1) * cnt;
        const limit = cnt;

        return await LogController.getDocLogsByUserName(
            userName,
            limit,
            skip
        );
    }

}