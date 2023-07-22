import WikiDB from './wikiDB.js';
import WikiManager from './wikiManager.js';
import WikiCategorizer from './wikiCategorizer.js';
import WikiLogger from './wikiLogger.js';

class WikiEngine {

    #wikiDB
    #wikiManager
    #wikiCategorizer
    #wikiLogger

    constructor() {
        this.#wikiDB = new WikiDB();
        this.#wikiManager = new WikiManager();
        this.#wikiCategorizer = new WikiCategorizer();
        this.#wikiLogger = new WikiLogger();
    }

    async init() {
        const DOC_INFO = await this.#wikiDB.init();
    }

}

export default WikiEngine;