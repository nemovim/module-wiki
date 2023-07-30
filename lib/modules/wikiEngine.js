import WikiDB from './wikiDB.js';
import WikiManager from './wikiManager.js';
import WikiLogger from './wikiLogger.js';

class WikiEngine {
    #wikiDB;
    #wikiManager;
    #wikiLogger;

    constructor(MONGO_URI) {
        this.#wikiDB = new WikiDB(MONGO_URI);
        this.#wikiManager = new WikiManager();
        this.#wikiLogger = new WikiLogger();
    }

    async init() {
        try {
            const DOC_ARRAY = await this.#wikiDB.init();
            this.#wikiManager.init(DOC_ARRAY);
            return true;
        } catch (e) {
            throw new Error(e);
        }
    }

    async writeDoc(title, content, author, comment) {
        try {

            let t = new Date().getTime();

            let { docArray, updateCategoryMap } = this.#wikiManager.createDoc(title, content, author, comment, []);

            let result = await Promise.allSettled([
                this.#wikiDB.writeDocs(docArray),
                this.#wikiDB.updateCategories(updateCategoryMap),
            ]);

            console.log(`dt: ${new Date().getTime() - t}`);

            return result;

        } catch (e) {
            throw new Error(e);
        }
    }

    async readDoc(title) {
        try {
            let t = new Date().getTime();

            let result = await this.#wikiDB.readDoc(this.#wikiManager.getDoc(title));

            console.log(`dt: ${new Date().getTime() - t}`);

            return result;
        } catch(e) {
            throw new Error(e);
        }
    }
}

export default WikiEngine;
