import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true },
        categorizedArr: { type: [String], default: [] },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Category', categorySchema);
