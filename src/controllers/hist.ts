import type { Doc, DocId } from '../types/doc';
import type { UserEmail, UserName } from '../types/user';
import type { Hist, HistDoc } from '../types/hist';

import HistModel from '../models/hist';

export default class HistController {

    static async getHistByDocId(docId: DocId, revision: number = -1): Promise<HistDoc|null> {
        if (revision === -1) {
            // The most recent history
            return (
                await HistModel.find({
                    docId,
                })
                    .sort({
                        revision: -1,
                    })
                    .limit(1)
            )[0];
        } else {
            return await HistModel.findOne({
                docId,
                revision,
            });
        }
    }

    // static async getHistsByDocId(docId: DocId, fromRev: number, toRev: number): Promise<Array<HistDoc>> {
    //     return await HistModel.find({
    //         docId,
    //         revision: {
    //             $gte: fromRev, $lte: toRev
    //         },
    //     });
    // }

    static async setHistByDoc(doc: Doc): Promise<HistDoc> {
        const hist = new HistModel<Hist>({
            docId: doc.docId,
            revision: doc.revision,
            markup: doc.markup,
        });
        return await hist.save();
    }

}
