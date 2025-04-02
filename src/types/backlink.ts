import type { HydratedDocument } from 'mongoose';

export interface Backlink {
    fullTitle: string,
    linkedArr: string[],
    redirectedArr: string[],
}

export type BacklinkDoc = HydratedDocument<Backlink>; 

