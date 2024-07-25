import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        fullTitleArr: { type: [String], default: []},
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Common', schema);
