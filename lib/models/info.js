import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        docId: { type: String, unique: true, required: true },
        fullTitle: { type: String, unique: true, required: true },
        type: { type: String, required: true },
        state: { type: String, required: true },
        authorityObj: { type: Object, required: true },
        revision: { type: Number, required: true },
        categorizedArr: { type: [String], default: []},
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Info', schema);
