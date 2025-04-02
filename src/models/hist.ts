import mongoose from 'mongoose';
import type { Hist } from '../types/hist';

const schema = new mongoose.Schema<Hist>(
    {
        docId: { type: String, required: true },
        revision: { type: Number, required: true },
        markup: { type: String, default: '' },
        userEmail: { type: String, required: true },
        userName: { type: String, required: true },
        comment: { type: String, default: '' },
        time: { type: Date, default: new Date()},
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Hist', schema);
