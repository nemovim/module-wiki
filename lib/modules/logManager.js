import Log from '../models/log.js';

export default class LogManager {

    static async getRecentWriteLogs(count=10) {
        return await Log.find({
            logType: "write"
        }).sort({'createdAt': -1}).limit(count);
    }

    static async setWriteLogByDoc(doc) {
        const log = Log({
            docId: doc.docId,
            fullTitle: doc.fullTitle,
            userName: doc.author,
            logType: "write",
            memo: doc.comment,
        });
        return await log.save();
    }

    static async setDeleteLogByDoc(doc) {
        const log = Log({
            docId: doc.docId,
            fullTitle: doc.fullTitle,
            userName: doc.author,
            logType: "delete",
            memo: doc.comment,
        });
        return await log.save();
    }

    static async setMoveLog(docId, fullTitle, newTitle, comment, userName) {
        const log = Log({
            docId,
            fullTitle,
            userName,
            logType: "move:"+newTitle,
            memo: comment,
        });
        return await log.save();
    }

}
