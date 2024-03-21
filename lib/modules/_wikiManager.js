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
}
