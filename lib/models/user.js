import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true},
        name: { type: String, required: true, unique: true},
        authority: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('User', schema);
