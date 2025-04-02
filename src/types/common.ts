import type { HydratedDocument } from 'mongoose';

export interface Common {
    fullTitleArr: Array<string>
}

export type CommonDoc = HydratedDocument<Common>;
