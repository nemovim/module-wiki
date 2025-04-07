import type { CommonDoc } from '../types/common';

import CommonModel from '../models/common.js';

export default class CommonController {

    static async initCommon(): Promise<CommonDoc> {
        const common = new CommonModel();
        return await common.save();
    }

    static async getCommon(): Promise<CommonDoc> {
        const common = await CommonModel.findOne();
        if (common == null) throw new Error('The CommonModel must be initialized first!');
        return common;
    }

    static async addFullTitle(fullTitle: string): Promise<void> {
        await CommonModel.findOneAndUpdate({}, { $push: { fullTitleArr: fullTitle } });
    }

    static async removeFullTitle(fullTitle: string): Promise<void> {
        await CommonModel.findOneAndUpdate({}, { $pull: { fullTitleArr: fullTitle } });
    }

    static async updateFullTitle(prevFullTitle: string, newFullTitle: string): Promise<void> {
        await this.removeFullTitle(prevFullTitle);
        await this.addFullTitle(newFullTitle);
    }

    static async addContribCnt(delta: number): Promise<void> {
        await CommonModel.findOneAndUpdate({}, { $inc: { contribCnt: delta } });
    }

    static async addDocCnt(delta: number): Promise<void> {
        await CommonModel.findOneAndUpdate({}, { $inc: { docCnt: delta } });
    }

    static async addUserCnt(delta: number): Promise<void> {
        await CommonModel.findOneAndUpdate({}, { $inc: { userCnt: delta } });
    }

}
