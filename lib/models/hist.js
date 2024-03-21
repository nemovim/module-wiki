import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        docId: { type: String, required: true },
        revision: { type: Number, required: true },
        content: { type: String, default: '' },
        author: { type: String, required: true },
        comment: { type: String, default: '' },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Hist', schema);
