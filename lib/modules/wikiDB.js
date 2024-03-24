import mongoose from 'mongoose';

export default class WikiDB {
    async init() {
        return await mongoose.connect(process.env.WIKI_MONGO_URI);
    }
}
