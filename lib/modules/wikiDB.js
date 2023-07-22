import mongoose from 'mongoose';
import Doc from '../models/doc.js';
import History from '../models/history.js';
import User from '../models/user.js';

class WikiDB {
    #db;

    constructor() {}

    async init() {
        this.#db = await mongoose.connect(process.env.MONGO_URI);
        return await Doc.find({});
    }
}

export default WikiDB;
