import type { InfoDoc, Info } from '../types/info';
import type { Doc, DocId } from '../types/doc';

import InfoModel from '../models/info';

export default class InfoController {

    static async getInfoByFullTitle(fullTitle: string): Promise<InfoDoc | null> {
        return await InfoModel.findOne({
            fullTitle,
        });
    }

    static async getInfoByDocId(docId: DocId): Promise<InfoDoc | null> {
        return await InfoModel.findOne({
            docId,
        });
    }

    static async getInfosByDocIdArr(docIdArr: DocId[]): Promise<Array<InfoDoc | null>> {
        const infoArr = await InfoModel.find({
            docId: {
                $in: docIdArr
            }
        });

        const infoMap = new Map<DocId, InfoDoc | null>();
        infoArr.forEach(info => {
            infoMap.set(info.docId, info);
        });
        return docIdArr.map(docId => {
            return infoMap.get(docId) || null;
        });
    }

    static async getInfosByFullTitleArr(fullTitleArr: string[]): Promise<Array<InfoDoc | null>> {
        const infoArr = await InfoModel.find({
            fullTitle: {
                $in: fullTitleArr
            }
        });
        const infoMap = new Map<string, InfoDoc | null>();
        infoArr.forEach(info => {
            infoMap.set(info.fullTitle, info);
        });
        return fullTitleArr.map(fullTitle => {
            return infoMap.get(fullTitle) || null;
        });
    }

    static async getAllInfos(): Promise<Array<InfoDoc>> {
        return await InfoModel.find({});
    }

    static async setInfoByDoc(doc: Partial<Doc> & Info): Promise<InfoDoc> {
        const info = new InfoModel<Info>(doc);
        return await info.save();
    }

    static async updateInfoByDoc(doc: Partial<Doc> & Info): Promise<InfoDoc> {
        const info = await this.getInfoByDocId(doc.docId);
        if (!info) {
            return await this.setInfoByDoc(doc);
        } else {
            info.fullTitle = doc.fullTitle;
            info.authority = doc.authority;
            info.state = doc.state;
            info.categorizedArr = doc.categorizedArr;
            info.revision = doc.revision;
            return await info.save();
        }
    }
}
