import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        history: { type: Number, required: true },
        content: { type: String, default: '' },
        author: { type: String, required: true },
        comment: { type: String, default: '' },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('History', historySchema);
