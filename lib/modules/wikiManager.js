import WikiDoc from './wikiDoc.js';
import crypto from 'crypto';

class WikiManager {
    #typeObj;
    #idMap;
    #typeMap;
    #stateMap;
    #titleMap;
    #historyMap;
    #authorityMap;

    constructor() {
        this.#typeObj = JSON.parse(process.env.TYPE_STRING);
        this.#idMap = new Map();
        this.#typeMap = new Map();
        this.#stateMap = new Map();
        this.#titleMap = new Map();
        this.#historyMap = new Map();
        this.#authorityMap = new Map();
    }

    firstInit(categorizedTitle, uncategorizedTitle) {
        let categorizedFullTitle =
            this.#typeObj['category'] + ':' + categorizedTitle;

        let categorizedCategory = this.makeDoc({
            fullTitle: categorizedFullTitle,
            content: '',
            comment: '',
            author: 'system',
            state: 'normal',
        });

        let uncategorizedCategory = this.makeDoc({
            fullTitle: this.#typeObj['category'] + ':' + uncategorizedTitle,
            content: '[#[' + categorizedTitle + ']]',
            comment: '',
            author: 'system',
            state: 'normal',
        });

        const AUTHORITY_OBJ = {
            read: 1,
            write: 100,
            update: 100,
            delete: 100,
        };

        categorizedCategory.authorityObj = AUTHORITY_OBJ;
        uncategorizedCategory.authorityObj = AUTHORITY_OBJ;

        return {
            categorizedCategory,
            uncategorizedCategory,
        };
    }

    init(docArr, _typeObj = {}) {
        this.#typeObj =
            Object.keys(this.#typeObj).length === 0 ? _typeObj : this.#typeObj;
        docArr.forEach((doc) => {
            this.#idMap.set(this.getFullTitle(doc.type, doc.title), doc.id);
            this.#typeMap.set(doc.id, doc.type);
            this.#stateMap.set(doc.id, doc.state);
            this.#titleMap.set(doc.id, doc.title);
            this.#historyMap.set(doc.id, doc.history);
            this.#authorityMap.set(doc.id, doc.authorityObj);
        });
    }

    getDoc(fullTitle) {
        const ID = this.getIdByFullTitle(fullTitle);

        console.log(`id: ${ID}`);

        let params = {
            id: ID,
            type: this.#typeMap.get(ID) || this.getTypeByFullTitle(fullTitle),
            title: this.#titleMap.get(ID) || this.getTitleByFullTitle(fullTitle),
            history: this.#historyMap.get(ID),
            authorityObj: this.#authorityMap.get(ID),
        };

        return new WikiDoc(params);
    }

    createId(fullTitle) {
        const ID = crypto.randomBytes(12).toString('base64');
        this.#idMap.set(fullTitle, ID);
        const TYPE = this.getTypeByFullTitle(fullTitle);
        const TITLE = this.getTitleByFullTitle(fullTitle);
        this.#titleMap.set(ID, TITLE);
        this.#typeMap.set(ID, TYPE);

        console.log(
            `fullTitle: ${fullTitle} | type: ${TYPE} | title: ${TITLE}`
        );

        return {
            id: ID,
            type: TYPE,
            title: TITLE,
        };
    }

    makeDoc({ fullTitle, content, author, comment }) {
        if (this.isNew(fullTitle)) {
            const { id, type } = this.createId(fullTitle);
            return this.makeNewDocById({
                id,
                content,
                author,
                comment,
                type,
                state: 'normal',
            });
        } else {
            return this.makeNextDocById({
                id: this.getIdByFullTitle(fullTitle),
                content,
                author,
                comment,
                type: this.getTypeByFullTitle(fullTitle),
                state: 'normal',
            });
        }
    }

    makeNewDocById({ id, content, author, comment, type, state }) {
        const TITLE = this.getTitleById(id);
        const HISTORY = 1;
        let params = {
            id,
            title: TITLE,
            content,
            author,
            comment,
            history: HISTORY,
            type,
            state,
        };

        let newDoc = new WikiDoc(params);

        this.#historyMap.set(id, HISTORY);
        this.#authorityMap.set(id, newDoc.authorityObj);

        return newDoc;
    }

    makeNextDocById({ id, content, author, comment, type, state }) {
        const TITLE = this.getTitleById(id);
        const NEW_HISTORY = this.#historyMap.get(id) + 1;
        const AUTHORITY = this.#authorityMap.get(id);
        let params = {
            id,
            title: TITLE,
            content,
            author,
            comment,
            history: NEW_HISTORY,
            authorityObj: AUTHORITY,
            type,
            state,
        };

        this.#historyMap.set(id, NEW_HISTORY);

        return new WikiDoc(params);
    }

    // --------------------- category ------------------------

    convertCategoryTitleToId({addCategoryTitleArr, removeCategoryTitleArr}) {
        let addCategoryIdArr = addCategoryTitleArr.map((title) => {
            let fullTitle = this.#typeObj['category'] + ':' + title;
            if (this.isNew(fullTitle)) {
                return this.createId(fullTitle).id;
            } else {
                return this.getIdByFullTitle(fullTitle);
            }
        });

        let removeCategoryIdArr = removeCategoryTitleArr.map((title) => {
            let fullTitle = this.#typeObj['category'] + ':' + title;
            if (this.isNew(fullTitle)) {
                return this.createId(fullTitle).id;
            } else {
                return this.getIdByFullTitle(fullTitle);
            }
        });

        return {
            addCategoryIdArr,
            removeCategoryIdArr,
        };
    }

    createCategoriesByIdArr(idArr) {
        return idArr.map((id) => {
            return this.makeNewDocById({
                id,
                content: '',
                author: 'system',
                comment: '',
                type: 'category',
                state: 'normal',
            });
        });
    }

    deleteCategoriesByIdArr(idArr) {
        return idArr.map((id) => {
            return this.makeNextDocById({
                id,
                content: '',
                author: 'system',
                comment: '',
                type: 'category',
                state: 'normal',
            });
        });
    }
    // --------------------- utils --------------------------

    isNew(fullTitle) {
        return !this.#idMap.has(fullTitle);
    }

    getIdByFullTitle(fullTitle) {
        return this.#idMap.get(fullTitle);
    }

    getFullTitleById(id) {
        return this.getFullTitle(this.#typeMap.get(id), this.#titleMap.get(id));
    }

    getTitleById(id) {
        return this.#titleMap.get(id);
    }

    getTitleByFullTitle(fullTitle) {
        if (fullTitle.search(':') === -1) {
            return fullTitle;
        } else {
            return fullTitle.split(':')[1];
        }
    }

    getTypeByFullTitle(fullTitle) {
        if (fullTitle.search(':') === -1) {
            return 'normal';
        } else {
            return Object.keys(this.#typeObj).find(
                (key) => this.#typeObj[key] === fullTitle.split(':')[0]
            );
        }
    }

    getFullTitle(type, title) {
        if (type === 'normal') {
            return title;
        } else {
            return this.#typeObj[type] + ':' + title;
        }
    }

    getInfoArr() {
        let infoArr = [];
        this.#typeMap.forEach((type, id) => {
            infoArr.push({
                id,
                type,
                title: this.getFullTitleById(id),
            });
        });
        return infoArr;
    }

    /*

    getHistoryByTitle(title) {
        return this.#historyMap.get(this.#idMap.get(title));
    }
    */
}

export default WikiManager;
