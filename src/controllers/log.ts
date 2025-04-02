import type { Doc } from '../types/doc';
import type { DocAction, UserAction, DocLogDoc, DocLog, UserLogDoc, UserLog, PenaltyLog, PenaltyAction, PenaltyLogDoc } from '../types/log';
import type { Penalty } from '../types/penalty';
import type { UserEmail } from '../types/user';

import { UserLogModel, DocLogModel, PenaltyLogModel } from '../models/log';

export default class LogController {

    // ============ Doc Logs ==============

    static makeDocLogByDocAndAction(doc: Doc, action: DocAction): DocLogDoc {
        return new DocLogModel<DocLog>({
            docId: doc.docId,
            fullTitle: doc.fullTitle,
            userEmail: doc.userEmail,
            comment: doc.comment,
            action: action,
            time: new Date(),
        });
    }

    static async getRecentWriteLogs(count: number = 10): Promise<Array<DocLogDoc>> {
        return await DocLogModel.find({
            action: "write"
        }).sort({ 'createdAt': -1 }).limit(count);
    }

    static async setWriteLogByDoc(doc: Doc): Promise<DocLogDoc> {
        const log = this.makeDocLogByDocAndAction(doc, 'write');
        return await log.save();
    }

    static async setDeleteLogByDoc(doc: Doc): Promise<DocLogDoc> {
        const log = this.makeDocLogByDocAndAction(doc, 'delete');
        return await log.save();
    }

    static async setMoveLogByDoc(doc: Doc): Promise<DocLogDoc> {
        const log = this.makeDocLogByDocAndAction(doc, 'move');
        return await log.save();
    }

    // ============ User Logs ==============

    static async setUserLogByEmailAndAction(email: UserEmail, action: UserAction, comment = ''): Promise<UserLogDoc> {
        const userLog = new UserLogModel<UserLog>({
            action,
            userEmail: email,
            comment,
            time: new Date(),
        });
        return await userLog.save();
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
