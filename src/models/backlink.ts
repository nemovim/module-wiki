import mongoose from 'mongoose';
import type { Backlink } from '../types/backlink';

const schema = new mongoose.Schema<Backlink>(
    {
        fullTitle: { type: String, required: true },
        linkedArr: { type: [String], default: []},
        redirectedArr: { type: [String], default: []},
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Backlink', schema);
