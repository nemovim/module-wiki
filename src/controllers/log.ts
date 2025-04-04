import type { Doc, DocId } from '../types/doc';
import type { DocAction, UserAction, DocLogDoc, DocLog, UserLogDoc, UserLog, PenaltyLog, PenaltyAction, PenaltyLogDoc } from '../types/log';
import type { Penalty } from '../types/penalty';
import type { User, UserEmail, UserName } from '../types/user';

import { UserLogModel, DocLogModel, PenaltyLogModel } from '../models/log.js';
import GeneralUtils from '../utils/general.js';

export default class LogController {

    // ============ Doc Logs ==============

    static #makeSystemLogByAction(action: DocAction, prevDoc: Doc | null, nextDoc: Doc): string {
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
            if (!prevDoc?.state)
                throw new Error("The state of prevDoc must exist!")
            return `${prevDoc.state}→${nextDoc.state}`;
        }
        else
            return '';
    }

    static async setDocLogByAction(action: DocAction, prevDoc: Doc | null, nextDoc: Doc, user: User, comment?: string): Promise<DocLogDoc> {
        const delta = GeneralUtils.calcByte(nextDoc.markup) - GeneralUtils.calcByte(prevDoc?.markup || '');
        const systemLog = this.#makeSystemLogByAction(action, prevDoc, nextDoc);
        const docLog = new DocLogModel<DocLog>({
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
        });
        return await docLog.save();
    }

    static async updateNamesOfAllDocLogsByEmail(userEmail: UserEmail, userName: UserName) {
        await DocLogModel.updateMany({ userEmail }, { userName });
    }

    static async updateFullTitlesOfAllDocLogsByDocId(docId: DocId, fullTitle: string) {
        await DocLogModel.updateMany({ docId }, { fullTitle });
    }

    static async getRecentWriteLogs(count: number = 10): Promise<Array<DocLogDoc>> {
        return await DocLogModel.find({
            action: ['create', 'edit']
        }).sort({ 'createdAt': -1 }).limit(count);
    }

    static async getDocLogsByDocId(docId: DocId, fromRev: number, toRev: number, cnt = 10): Promise<Array<DocLogDoc>> {
        return await DocLogModel.find({
            docId,
            revision: {
                $gte: fromRev, $lte: toRev
            },
        }).sort({createdAt: -1}).limit(cnt);
    }

    static async getDocLogsByUserName(userName: UserName, cnt = 10): Promise<Array<DocLogDoc>> {
        return await DocLogModel.find({
            userName,
        }).sort({createdAt: -1}).limit(cnt);
    }

    // ============ User Logs ==============

    static async setUserLogByEmailAndAction(email: UserEmail, action: UserAction, systemLog?: string): Promise<UserLogDoc> {
        const userLog = new UserLogModel<UserLog>({
            action,
            userEmail: email,
            systemLog: systemLog || '',
            time: new Date(),
        });
        return await userLog.save();
    }

    static async getMostRecentChangeNameLogByEmail(userEmail: UserEmail): Promise<UserLogDoc|null> {
        return (await UserLogModel.find({userEmail, action: 'change_name'}).sort({createdAt:-1}).limit(1))[0] || null;
    }


    // ============ Penalty Logs ==============

    static makePenaltyLogByPenaltyAndAction(penalty: Penalty, action: PenaltyAction): PenaltyLogDoc {
        return new PenaltyLogModel<PenaltyLog>({
            action,
            penaltyType: penalty.type,
            userEmail: penalty.penalizerEmail,
            penalizedEmail: penalty.penalizedEmail,
            duration: penalty.duration,
            comment: penalty.comment,
            time: new Date(),
        });
    }

    static async setApplyingPenaltyLogByPenalty(penalty: Penalty): Promise<PenaltyLogDoc> {
        const log = this.makePenaltyLogByPenaltyAndAction(penalty, 'apply');
        return await log.save();
    }

    static async setRemovingPenaltyLogByPenalty(penalty: Penalty): Promise<PenaltyLogDoc> {
        const log = this.makePenaltyLogByPenaltyAndAction(penalty, 'remove');
        return await log.save();
    }

}
