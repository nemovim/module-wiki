import mongoose from 'mongoose';

const docSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        type: { type: String, required: true },
        state: { type: String, required: true },
        authorityObj: { type: Object, required: true },
        history: { type: Number, required: true },
        // categoryArr: { type: [String], default: []},
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Doc', docSchema);
