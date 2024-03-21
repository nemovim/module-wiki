import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true},
        authorityObj: { type: Object, required: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('User', userSchema);
