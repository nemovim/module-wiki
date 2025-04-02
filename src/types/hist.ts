import type { HydratedDocument } from 'mongoose';
import type { DocId } from './doc';
import type { UserName, UserEmail } from './user';

export interface Hist {
    docId: DocId,
    revision: number,
    markup: string,
    userEmail: UserEmail,
    userName: UserName,
    comment: string,
    time: Date,
}

export type HistDoc = HydratedDocument<Hist>; 

