import mongoose from 'mongoose';
import Doc from '../models/doc.js';
import History from '../models/history.js';
import User from '../models/user.js';

class WikiDB {
    #db;
    #uri

    constructor(_uri) {
        this.#uri = _uri;
    }

    async init() {
        this.#db = await mongoose.connect(this.#uri);
        return await Doc.find({});
    }

    async writeDocs(docArray) {
        let promiseArray = [];
        docArray.forEach(doc => {
            promiseArray.push(new Promise(resolve => {
                resolve(this.writeDoc(doc));
            }));
        });
        return await Promise.allSettled(...promiseArray);
    }

    async writeDoc(doc) {
        if (doc.history === 1) {
            return await this.writeNewDoc(doc);
        } else {
            return await this.writeNextDoc(doc);
        }
    }

    async writeNewDoc(_doc) {
        let doc = new Doc(_doc.getDocJSON());
        await doc.save();
        return await this.writeHistory(_doc);
    }

    async writeNextDoc(doc) {
        await Doc.updateOne({
            id: doc.id,
        }, {
            $set: {
                history: doc.history
            }
        });
        return await this.writeHistory(doc);
    }

    async writeHistory(doc) {
        let history = new History(doc.getHistoryJSON());
        return await history.save();
    }

    async updateCategories(categorizingMap) {
        let categorizingArray = [];
        categorizingMap.forEach((categorized, id) => {
            categorizingArray.push(
                this.updateCategory(id, categorized)
            );
        });
        return await Promise.allSettled(...categorizingArray);
    }

    async updateCategory(id, categorized) {
        return await Doc.updateOne({
            id: id,
        }, {
            $set: {
                categorized: categorized,
            }
        });
    }
}

export default WikiDB;
