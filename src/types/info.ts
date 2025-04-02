import type { HydratedDocument } from 'mongoose';
import type { DocId, DocType, DocState } from './doc';
import type { Authority } from './authority';

export interface Info {
    docId: DocId,
    fullTitle: string,
    type: DocType,
    state: DocState,
    authority: Authority,
    revision: number,
    categorizedArr: DocId[],
}

export type InfoDoc = HydratedDocument<Info>;