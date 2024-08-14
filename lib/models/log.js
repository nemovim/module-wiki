import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        docId: { type: String, required: true },
        fullTitle: { type: String, required: true },
        userName: { type: String, required: true },
        logType: { type: String, required: true },
        memo: { type: String, default: ''},
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Log', schema);
