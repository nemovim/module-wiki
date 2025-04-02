import mongoose from 'mongoose';
import type { DocLog, PenaltyLog, UserLog } from '../types/log';

const schema_doc = new mongoose.Schema<DocLog>(
    {
        docId: { type: String, required: true },
        fullTitle: { type: String, required: true },
        userEmail: { type: String, required: true },
        action: { type: String, required: true },
        comment: { type: String, default: '' },
        time: {type: Date, default: new Date()},
    },
    {
        timestamps: true,
    }
);

const schema_user = new mongoose.Schema<UserLog>(
    {
        userEmail: { type: String, required: true },
        action: { type: String, required: true },
        comment: { type: String, default: '' },
        time: {type: Date, default: new Date()},
    },
    {
        timestamps: true,
    }
);

const schema_penalty = new mongoose.Schema<PenaltyLog>(
    {
        userEmail: { type: String, required: true },
        penaltyType: { type: String, required: true },
        action: { type: String, required: true },
        penalizedEmail: { type: String, required: true},
        duration: { type: Number, required: true },
        comment: { type: String, default: '' },
        time: {type: Date, default: new Date()},
    },
    {
        timestamps: true,
    }
);

export const DocLogModel =  mongoose.model('Doc-Log', schema_doc);
export const UserLogModel =  mongoose.model('User-Log', schema_user);
export const PenaltyLogModel =  mongoose.model('Penalty-Log', schema_penalty);
