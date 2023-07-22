import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true },
        authority: { type: Object, required: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('User', userSchema);
