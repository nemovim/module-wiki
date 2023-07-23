import { WikiDoc, WikiCategory } from './docs.js';
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

    isNew(title) {
        return !this.#idMap.has(title);
    }

    isCategory(title) {
        const ID = this.#idMap.get(title) || -1;
        return this.#categoryMap.has(ID);
    }

    createDoc(title, content, author, comment, categorizedArray = []) {
        if (this.isNew(title)) {
            return this.createNewDoc(title, content, author, comment, categorizedArray);
        } else {
            return this.createNextDoc(title, content, comment, author);
        }
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

    convertTitleToId(param) {
        if (param instanceof WikiCategory) {
            param.categorizedArray = this.convertTitleToId(
                param.categorizedArray
            );
            param.id = this.convertTitleToId(param.title);
        } else if (param instanceof WikiDoc) {
            param.id = this.convertTitleToId(param.title);
        } else if (param instanceof Map) {
            let temp = new Map(param.entries());
            param = new Map();
            temp.forEach((val, key) => {
                param.set(
                    this.convertTitleToId(key),
                    this.convertTitleToId(val)
                );
            });
        } else if (param instanceof Array) {
            param = param.map((title) => {
                return this.convertTitleToId(title);
            });
        } else if (typeof param === 'string') {
            param = this.#idMap.get(param);
        }
        return param;
    }

    convertIdToTitle(param) {
        if (param instanceof WikiCategory) {
            param.categorizedArray = this.convertIdToTitle(
                param.categorizedArray
            );
            param.title = this.convertIdToTitle(param.id);
        } else if (param instanceof WikiDoc) {
            param.title = this.convertIdToTitle(param.id);
        } else if (param instanceof Map) {
            let temp = new Map(param.entries());
            param = new Map();
            temp.forEach((val, key) => {
                param.set(
                    this.convertIdToTitle(key),
                    this.convertIdToTitle(val)
                );
            });
        } else if (param instanceof Array) {
            param = param.map((id) => {
                return this.convertIdToTitle(id);
            });
        } else if (typeof param === 'string') {
            param = this.#titleMap.get(param);
        }
        return param;
    }
}

export default WikiManager;
