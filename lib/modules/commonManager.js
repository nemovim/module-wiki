import Common from '../models/common.js';

export default class CommonManager {

    static async initCommon() {
        const common = new Common();
        return await common.save();
    }

    static async getCommon() {
        return await Common.findOne({});
    }
    static async getFullTitleArr() {
        return (await this.getCommon()).fullTitleArr;
    }

    static async addFullTitle(fullTitle) {
        const common = await this.getCommon();
        common.fullTitleArr.push(fullTitle);
        return await common.save();
    }

    static async removeFullTitle(fullTitle) {
        const common = await this.getCommon();
        common.fullTitleArr.splice(common.fullTitleArr.indexOf(fullTitle), 1);
        return await common.save();
    }

    static async updateFullTitle(prevFullTitle, newFullTitle) {
        const common = await this.getCommon();
        common.fullTitleArr[common.fullTitleArr.indexOf(prevFullTitle)] = newFullTitle;
        return await common.save();
    }
}
