import mongoose from 'mongoose';
import Common from '../models/common.js';
import Doc from '../models/doc.js';
import Category from '../models/category.js';
import History from '../models/history.js';
import User from '../models/user.js';

class WikiDB {
    #db;
    #uri;

    constructor() {
        this.#uri = process.env.MONGO_URI;
    }

    async init() {
        this.#db = await mongoose.connect(this.#uri);
        console.log('[DB Is Connected]');

        const t = new Date().getTime();

        const DATA = await Promise.allSettled([
            Common.findOne(),
            Doc.find(),
            Category.find(),
        ]);

        console.log(`[Data Fetch Time: ${new Date().getTime() - t}ms]`);

        return {
            COMMON_DATA: DATA[0].value,
            DOC_ARR: DATA[1].value,
            CATEGORY_ARR: DATA[2].value,
        };

        // console.log('[Finding Common Data...]');
        // const COMMON_DATA = await Common.findOne();
        // console.log('[Finding Doc Data...]');
        // const DOC_ARR = await Doc.find();
        // console.log('[Finding Category Data...]');
        // const CATEGORY_ARR = await Category.find();

        // return {
        //     COMMON_DATA,
        //     DOC_ARR,
        //     CATEGORY_ARR,
        // };
    }

    async readDoc(doc) {

        console.log(doc);

        let data = await History.findOne({
            id: doc.id,
            history: doc.history,
        });

        console.log('Data of readDoc in DB: ');
        console.log(data);

        if (data !== null) {
            doc.content = data.content;
            doc.comment = data.comment;
            doc.author = data.author;
            doc.editedTime = new Date(data.createdAt).getTime();
        }

        return doc;
    }

    async writeDocs(docArr) {
        let promiseArr = [];
        docArr.forEach((doc) => {
            promiseArr.push(
                new Promise((resolve) => {
                    resolve(this.writeDoc(doc));
                })
            );
        });
        return await Promise.allSettled(promiseArr);
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
        if (_doc.type === 'category') {
            let category = new Category({
                id: _doc.id,
                categorizedArr: [],
            });
            await category.save();
        }
        await doc.save();
        return await this.writeHistory(_doc);
    }

    async writeNextDoc(doc) {
        await Doc.updateOne(
            {
                id: doc.id,
            },
            {
                $set: {
                    history: doc.history,
                    state: doc.state,
                },
            }
        );
        return await this.writeHistory(doc);
    }

    async writeHistory(doc) {
        let history = new History(doc.getHistoryJSON());
        return await history.save();
    }

    async updateCategories(updateCategoryMap) {
        let updateCategoryFunctionArr = [];
        updateCategoryMap.forEach((categorizedArr, id) => {
            updateCategoryFunctionArr.push(
                this.updateCategory(id, categorizedArr)
            );
        });
        return await Promise.allSettled(updateCategoryFunctionArr);
    }

    async updateCategory(id, categorizedArr) {
        return await Category.updateOne(
            {
                id: id,
            },
            {
                $set: {
                    categorizedArr: categorizedArr,
                },
            }
        );
    }

    async readUser(id) {
        let data = await User.findOne({
            id
        });

        return {
            id: id,
            authority: data.authority,
        };
    }
}

export default WikiDB;
