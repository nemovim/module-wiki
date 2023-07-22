import mongoose from 'mongoose';

const docSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true },
        title: String,
        authority: Object,
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Doc', docSchema);
