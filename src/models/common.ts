import mongoose from 'mongoose';
import type { Common } from '../types/common';

const schema = new mongoose.Schema<Common>(
    {
        fullTitleArr: { type: [String], default: []},
        userCnt: { type: Number, default: 0},
        docCnt: { type: Number, default: 0},
        contribCnt: { type: Number, default: 0},
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Common', schema);
