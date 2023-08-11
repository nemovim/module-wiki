import mongoose from 'mongoose';

const commonSchema = new mongoose.Schema(
    {
        typeObj: { type: Object, required: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Common', commonSchema);
