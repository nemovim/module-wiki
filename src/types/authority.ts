import type { DocAction } from './log';
import type { UserEmail } from './user';

export type Group = 'any' | 'guest' | 'user' | 'dev' | 'system' | 'manager' | 'blocked' | UserEmail;

export type Authority = Partial<Record<DocAction, Group[]>>