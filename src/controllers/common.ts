import type { CommonDoc } from '../types/common';

import CommonModel from '../models/common.js';

export default class CommonController {

    static async initCommon(): Promise<CommonDoc> {
        const common = new CommonModel();
        return await common.save();
    }

    static async getCommon(): Promise<CommonDoc> {
        const common =  await CommonModel.findOne();
        if (common == null) throw new Error('The CommonModel must be initialized first!');
        return common;
    }

    static async getAllFullTitles(): Promise<string[]> {
        return (await this.getCommon()).fullTitleArr;
    }

    static async addFullTitle(fullTitle: string): Promise<CommonDoc> {
        const common = await this.getCommon();
        common.fullTitleArr.push(fullTitle);
        return await common.save();
    }

    static async removeFullTitle(fullTitle: string): Promise<CommonDoc> {
        const common = await this.getCommon();
        // console.log(`=====${fullTitle}=====`)
        // console.log(common.fullTitleArr);
        // console.log('==================')
        common.fullTitleArr.splice(common.fullTitleArr.indexOf(fullTitle), 1);
        return await common.save();
    }

    static async updateFullTitle(prevFullTitle: string, newFullTitle: string): Promise<CommonDoc> {
        const common = await this.getCommon();
        common.fullTitleArr[common.fullTitleArr.indexOf(prevFullTitle)] = newFullTitle;
        return await common.save();
    }
}
