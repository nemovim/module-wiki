import mongoose from 'mongoose';

const docSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        authority: { type: Object, required: true },
        history: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Doc', docSchema);
