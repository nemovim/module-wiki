import type { BacklinkDoc, Backlink } from '../types/backlink';

import BacklinkModel from '../models/backlink.js';

export default class BacklinkController {

    static async getBacklinkByFullTitle(fullTitle: string): Promise<BacklinkDoc|null> {
        return await BacklinkModel.findOne({
            fullTitle,
        });
    }

    static isEmptyBacklink(backlink: Backlink): boolean {
        return backlink.linkedArr.length === 0 && backlink.redirectedArr.length === 0;
    }

    static async linkFromFormerToLatter(linkedFullTitle: string, fullTitle: string): Promise<void> {
        await BacklinkModel.findOneAndUpdate({ fullTitle }, { $addToSet: { linkedArr: linkedFullTitle } }, { new: true, upsert: true });
    }

    static async unlinkFromFormerToLatter(linkedFullTitle: string, fullTitle: string): Promise<void> {
        const updatedBacklink: BacklinkDoc = await BacklinkModel.findOneAndUpdate({ fullTitle }, { $pull: { linkedArr: linkedFullTitle } }, { new: true, upsert: true });
        if (this.isEmptyBacklink(updatedBacklink)) {
            await BacklinkModel.deleteOne({ fullTitle });
        }
    }

    static async redirectFromFormerToLatter(redirectedFullTitle: string, fullTitle: string): Promise<void> {
        await BacklinkModel.findOneAndUpdate({ fullTitle }, { $addToSet: { redirectedArr: redirectedFullTitle } }, { new: true, upsert: true });
    }

    static async unredirectFromFormerToLatter(redirectedFullTitle: string, fullTitle: string): Promise<void> {
        const updatedBacklink: BacklinkDoc = await BacklinkModel.findOneAndUpdate({ fullTitle }, { $pull: { redirectedArr: redirectedFullTitle } }, { new: true, upsert: true });
        if (this.isEmptyBacklink(updatedBacklink)) {
            await BacklinkModel.deleteOne({ fullTitle });
        }
    }

}