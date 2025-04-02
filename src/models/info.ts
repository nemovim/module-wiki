import mongoose from 'mongoose';
import type { Info } from '../types/info';

const schema = new mongoose.Schema<Info>(
    {
        docId: { type: String, unique: true, required: true },
        fullTitle: { type: String, unique: true, required: true },
        type: { type: String, required: true },
        state: { type: String, required: true },
        authority: { type: Object, required: true },
        revision: { type: Number, required: true },
        categorizedArr: { type: [String], default: []},
    },
    {
        timestamps: true,
    }
);

// export default mongoose.models.Info || mongoose.model('Info', schema);
export default mongoose.model('Info', schema);
