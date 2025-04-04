import type { BacklinkDoc, Backlink } from '../types/backlink';

import BacklinkModel from '../models/backlink.js';

export default class BacklinkController {

    static async getBacklinkByFullTitle(fullTitle: string): Promise<BacklinkDoc> {
        const backlink = await BacklinkModel.findOne({
            fullTitle,
        });

        if (!backlink)
            return new BacklinkModel({ fullTitle, linkedArr: [], redirectedArr: [] });
        else
            return backlink;
    }

    static isEmptyBacklink(backlink: Backlink): boolean {
        return backlink.linkedArr.length === 0 && backlink.redirectedArr.length === 0;
    }

    static async linkFromFormerToLatter(linkedFullTitle: string, fullTitle: string): Promise<BacklinkDoc> {
        const backlink = await this.getBacklinkByFullTitle(fullTitle);
        if (backlink.linkedArr.includes(linkedFullTitle))
            return backlink;
        backlink.linkedArr.push(linkedFullTitle);
        return await backlink.save();
    }

    static async unlinkFromFormerToLatter(linkedFullTitle: string, fullTitle: string): Promise<BacklinkDoc> {
        const backlink = await this.getBacklinkByFullTitle(fullTitle);
        if (!backlink.linkedArr.includes(linkedFullTitle))
            return backlink;
        backlink.linkedArr.splice(backlink.linkedArr.indexOf(linkedFullTitle), 1);
        if (this.isEmptyBacklink(backlink)) {
            await BacklinkModel.deleteOne({ fullTitle: backlink.fullTitle });
            return backlink;
        } else {
            return await backlink.save();
        }
    }

    static async redirectFromFormerToLatter(redirectedFullTitle: string, fullTitle: string): Promise<BacklinkDoc> {
        const backlink = await this.getBacklinkByFullTitle(fullTitle);
        if (backlink.redirectedArr.includes(redirectedFullTitle))
            return backlink;
        backlink.redirectedArr.push(redirectedFullTitle);
        return await backlink.save();
    }

    static async unredirectFromFormerToLatter(redirectedFullTitle: string, fullTitle: string): Promise<BacklinkDoc> {
        const backlink = await this.getBacklinkByFullTitle(fullTitle);
        if (!backlink.redirectedArr.includes(redirectedFullTitle))
            return backlink;
        backlink.redirectedArr.splice(backlink.redirectedArr.indexOf(redirectedFullTitle), 1);
        if (this.isEmptyBacklink(backlink)) {
            await BacklinkModel.deleteOne({ fullTitle: backlink.fullTitle });
            return backlink;
        } else {
            return await backlink.save();
        }
    }

}