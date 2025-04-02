import type { Hist } from './hist';
import type { Info } from './info';
import type { Branded } from './general';

export type DocId = Branded<string, 'docId'>;
export type DocType = 'general' | 'category' | 'special';
export type DocState = 'normal' | 'forbidden' | 'deleted' | 'new';

export type Doc = Hist & Info & { html?: string }