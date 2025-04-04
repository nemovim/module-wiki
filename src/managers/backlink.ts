import type { Doc } from '../types/doc';

import BacklinkController from '../controllers/backlink.js';

import GeneralUtils from '../utils/general.js';
import MarkupUtils from '../utils/markup.js';
import WikiTranslator from '../utils/translator.js';

export default class BacklinkManager {
    static async createBacklinkMarkupByFullTitle(fullTitle: string): Promise<string|null> {
        const backlink = await BacklinkController.getBacklinkByFullTitle(fullTitle);
        if (BacklinkController.isEmptyBacklink(backlink))
            return null;
        return MarkupUtils.createAlignedMarkupByFullTitleArr(backlink.linkedArr, '연결된');
    }

    static async updatelinksByDocs(prevDoc: Partial<Doc>&{markup: string} | null, nextDoc: Partial<Doc>&{fullTitle: string, markup: string}): Promise<void> {
        const linkedFullTitle = nextDoc.fullTitle;

        const prevLinkArr = WikiTranslator.getAnchorFullTitleArr(prevDoc?.markup||'');
        const nextLinkArr = WikiTranslator.getAnchorFullTitleArr(nextDoc.markup);

        const addedLinkArr = GeneralUtils.getDiffArr(prevLinkArr, nextLinkArr);
        const removedLinkArr = GeneralUtils.getDiffArr(nextLinkArr, prevLinkArr);

        // TODO: Improve it by using bulkwrite

        for (let fullTitle of addedLinkArr) {
            await BacklinkController.linkFromFormerToLatter(linkedFullTitle, fullTitle);
        }

        for (let fullTitle of removedLinkArr) {
            await BacklinkController.unlinkFromFormerToLatter(linkedFullTitle, fullTitle);
        }
    }
}