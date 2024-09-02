import Hist from '../models/hist.js';

export default class HistManager {

    static async getHistByDocId(docId, revision = -1) {
        if (revision === -1) {
            // The most recent history
            return (
                await Hist.find({
                    docId,
                })
                    .sort({
                        revision: -1,
                    })
                    .limit(1)
            )[0];
        } else {
            return await Hist.findOne({
                docId,
                revision,
            });
        }
    }

    static async getHistsByDocId(docId, fromRev, toRev) {
        return await Hist.find({
            docId,
            revision: {
                $gte: fromRev, $lte: toRev
            },
        });
    }

    static async setHistByDoc(doc) {
        const hist = new Hist({
            docId: doc.docId,
            revision: doc.revision,
            markup: doc.markup,
            author: doc.author,
            comment: doc.comment,
        });
        return await hist.save();
    }
}
