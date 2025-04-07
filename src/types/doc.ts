import type { Hist } from './hist';
import type { Info } from './info';
import type { Branded } from './general';

export type DocId = Branded<string, 'docId'>;
export type DocType = 'general' | 'category' | 'wiki' | 'file' | 'hidden';
export type DocState = 'new' | 'normal' | 'deleted' | 'hidden';

export type Doc = Hist & Info & { html?: string }