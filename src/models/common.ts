import mongoose from 'mongoose';
import type { Common } from '../types/common';

const schema = new mongoose.Schema<Common>(
    {
        fullTitleArr: { type: [String], default: []},
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Common', schema);
