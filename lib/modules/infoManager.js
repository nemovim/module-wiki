import Info from '../models/info.js';

export default class InfoManager {
    static async getInfoByDocId(docId) {
        return await Info.findOne({
            docId,
        });
    }

    static async getInfosByDocIdArr(docIdArr) {
        return (
            await Promise.allSettled(
                docIdArr.map(async (docId) => {
                    return await this.getInfoByDocId(docId);
                })
            )
        ).value;
    }

    static async getInfoByFullTitle(fullTitle) {
        return await Info.findOne({
            fullTitle,
        });
    }

    static async getInfosByFullTitleArr(fullTitleArr) {
        return (
            await Promise.allSettled(
                fullTitleArr.map(async (fullTitle) => {
                    return await this.getInfoByFullTitle(fullTitle);
                })
            )
        ).value;
    }

    static async setInfoByDoc(doc)  {
        const info = new Info(doc);
        return await info.save();
    }

    static async updateInfoByDoc(doc) {
        return await Info.updateOne(
            {
                docId: doc.docId,
            },
            {
                fullTitle: doc.fullTitle,
                authorityObj: doc.authorityObj,
                state: doc.state,
                categorizedArr: doc.categorizedArr,
                revision: doc.revision,
            }
        );
    }

    // static async updateCategorizedArrByDocId(docId, categorizedArr) {
    //     return await Info.findOneAndUpdate(
    //         {
    //             docId,
    //         },
    //         {
    //             categorizedArr,
    //         }
    //     );
    // }
}
