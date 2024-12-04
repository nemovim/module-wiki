import mongoose from 'mongoose';

export default class WikiDB {
    async init(WIKI_MONGO_URI) {
        if (WIKI_MONGO_URI === undefined) {
            throw new Error('Please set WIKI_MONGO_URI at .env file!');
        }
        return await mongoose.connect(WIKI_MONGO_URI);
    }
}
