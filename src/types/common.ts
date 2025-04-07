import type { HydratedDocument } from 'mongoose';

export interface Common {
    fullTitleArr: Array<string>,
    docCnt: number,
    userCnt: number,
    contribCnt: number,
}

export type CommonDoc = HydratedDocument<Common>;
