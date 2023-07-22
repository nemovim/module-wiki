import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        history: { type: Number, required: true },
        content: String,
        author: String,
        comment: String,
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('History', historySchema);
