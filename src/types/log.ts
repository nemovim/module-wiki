import type { HydratedDocument } from 'mongoose';
import type { DocId } from './doc';
import type { UserEmail } from './user';
import type { PenaltyType } from './penalty';

export type DocAction = 'read' | 'write' | 'move' | 'delete' | 'authority' | 'state';
export type UserAction = 'signup' | 'signin' | 'edit' | 'change_name' | 'change_group';
export type PenaltyAction = 'apply' | 'remove';

export interface PenaltyLog {
    userEmail: UserEmail,
    comment: string,
    action: PenaltyAction, 
    penaltyType: PenaltyType,
    penalizedEmail: UserEmail,
    duration: number,
    time: Date,
}

export interface UserLog {
    userEmail: UserEmail,
    comment: string,
    action: UserAction,
    time: Date,
}

export interface DocLog {
    userEmail: UserEmail,
    comment: string,
    action: DocAction,
    docId: DocId,
    fullTitle: string,
    time: Date,
}

export type DocLogDoc = HydratedDocument<DocLog>;
export type UserLogDoc = HydratedDocument<UserLog>;
export type PenaltyLogDoc = HydratedDocument<PenaltyLog>;