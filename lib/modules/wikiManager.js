import { WikiDoc, WikiCategory } from './docs.js';
import { WikiTranslator } from './utils.js';
import crypto from 'crypto';

class WikiManager {
    #idMap;
    #titleMap;
    #historyMap;
    #authorityMap;
    #categoryMap;

    constructor() {
        this.#idMap = new Map();
        this.#titleMap = new Map();
        this.#historyMap = new Map();
        this.#authorityMap = new Map();
        this.#categoryMap = new Map();
    }

    init(docArray) {
        docArray.forEach((doc) => {
            this.#idMap.set(doc.title, doc.id);
            this.#titleMap.set(doc.id, doc.title);
            this.#historyMap.set(doc.id, doc.history);
            this.#authorityMap.set(doc.id, doc.authority);
            if (doc?.categorized !== undefined)
                this.#categoryMap.set(doc.id, doc.categorized);
        });
    }

    getDoc(title) {
        const ID = this.#idMap.get(title);

        let params = {
            id: ID,
            title: this.#titleMap.get(ID),
            authority: this.#authorityMap.get(ID),
            history: this.#historyMap.get(ID),
        };

        if (this.isCategory(title)) {
            params.categorized = this.#categoryMap.get(ID);
            return new WikiCategory(params);
        } else {
            return new WikiDoc(params);
        }
    }

    createDoc(title, content, author, comment) {
        let docArray = [];

        if (this.isNew(title)) {
            // This method is activated only when user creates a new doc.
            docArray.push(
                this.createNewDoc(title, content, author, comment, [])
            );
        } else {
            docArray.push(this.createNextDoc(title, content, author, comment));
        }

        let { updateCategoryMap, newCategoryMap } = this.categorizeDoc(docArray[0]);

        newCategoryMap.forEach((_categorized, _title) => {
            docArray.push(
                this.createNewDoc(_title, '', 'system', '', _categorized)
            );
        });

        return {
            docArray: docArray,
            updateCategoryMap: updateCategoryMap,
        };
    }

    createNewDoc(title, content, author, comment, categorizedArray = []) {
        const ID = crypto.randomBytes(12).toString('base64');
        const HISTORY = 1;
        let newDoc;

        if (categorizedArray.length !== 0) {
            console.log('Create new category');
            newDoc = new WikiCategory(
                {
                    id: ID,
                    title: title,
                    content: content,
                    author: author,
                    comment: comment,
                    history: HISTORY,
                },
                categorizedArray
            );
        } else {
            console.log('Create new doc');
            newDoc = new WikiDoc({
                id: ID,
                title: title,
                content: content,
                author: author,
                comment: comment,
                history: HISTORY,
            });
        }

        this.#idMap.set(title, ID);
        this.#titleMap.set(ID, title);
        this.#historyMap.set(ID, HISTORY);
        this.#authorityMap.set(ID, newDoc.authority);

        return newDoc;
    }

    createNextDoc(title, content, author, comment) {
        const ID = this.#idMap.get(title);
        const NEW_HISTORY = this.#historyMap.get(ID) + 1;
        const AUTHORITY = this.#authorityMap.get(ID);

        this.#historyMap.set(ID, NEW_HISTORY);

        if (this.isCategory(title)) {
            return new WikiCategory(
                {
                    id: ID,
                    title: title,
                    content: content,
                    author: author,
                    comment: comment,
                    history: NEW_HISTORY,
                    authority: AUTHORITY,
                },
                this.#categoryMap.get(ID)
            );
        } else {
            return new WikiDoc({
                id: ID,
                title: title,
                content: content,
                author: author,
                comment: comment,
                history: NEW_HISTORY,
                authority: AUTHORITY,
            });
        }
    }

    categorizeDoc(doc) {
        let { content, categoryArray } = WikiTranslator.toCategory(doc.content);

        categoryArray = categoryArray.map(category => {
            return this.#idMap.get(category);
        });

        return {
            updateCategoryMap: new Map(),
            newCategoryMap: new Map(),
        };
    }

    // --------------------- utils --------------------------

    /*
    isNew(title) {
        return !this.#idMap.has(title);
    }

    isCategory(title) {
        const ID = this.#idMap.get(title) || -1;
        return this.#categoryMap.has(ID);
    }

    getIdByTitle(title) {
        return this.#idMap.get(title);
    }

    getHistoryByTitle(title) {
        return this.#historyMap.get(this.#idMap.get(title));
    }

    convertTitleToId(param) {
        // if (param instanceof WikiCategory) {
        //     param.categorizedArray = this.convertTitleToId(
        //         param.categorizedArray
        //     );
        //     param.id = this.convertTitleToId(param.title);
        // } else if (param instanceof WikiDoc) {
        //     param.id = this.convertTitleToId(param.title);
        // } else if (param instanceof Map) {
        //     let temp = new Map(param.entries());
        //     param = new Map();
        //     temp.forEach((val, key) => {
        //         param.set(
        //             this.convertTitleToId(key),
        //             this.convertTitleToId(val)
        //         );
        //     });
        if (param instanceof Array) {
            param = param.map((title) => {
                return this.convertTitleToId(title);
            });
        } else if (typeof param === 'string') {
            param = this.#idMap.get(param);
        }
        return param;
    }

    convertIdToTitle(param) {
        // if (param instanceof WikiCategory) {
        //     param.categorizedArray = this.convertIdToTitle(
        //         param.categorizedArray
        //     );
        //     param.title = this.convertIdToTitle(param.id);
        // } else if (param instanceof WikiDoc) {
        //     param.title = this.convertIdToTitle(param.id);
        // } else if (param instanceof Map) {
        //     let temp = new Map(param.entries());
        //     param = new Map();
        //     temp.forEach((val, key) => {
        //         param.set(
        //             this.convertIdToTitle(key),
        //             this.convertIdToTitle(val)
        //         );
        //     });
        if (param instanceof Array) {
            param = param.map((id) => {
                return this.convertIdToTitle(id);
            });
        } else if (typeof param === 'string') {
            param = this.#titleMap.get(param);
        }
        return param;
    }
    */
}

export default WikiManager;
