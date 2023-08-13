import WikiDB from './wikiDB.js';
import WikiManager from './wikiManager.js';
import WikiCategorizer from './WikiCategorizer.js';
import WikiLogger from './wikiLogger.js';
import WikiDoc from './wikiDoc.js';
import { WikiTranslator } from './utils.js';

class WikiEngine {
    #wikiDB;
    #wikiManager;
    #wikiCategorizer;
    #wikiLogger;

    constructor() {

        this.#wikiDB = new WikiDB();
        this.#wikiManager = new WikiManager();
        this.#wikiCategorizer = new WikiCategorizer();
        this.#wikiLogger = new WikiLogger();
    }

    async init() {
        try {
            console.log('[Initiating Wiki DB...]');

            const { COMMON_DATA, DOC_ARR, CATEGORY_ARR } =
                await this.#wikiDB.init();

            if (DOC_ARR.length === 0) {
                console.log('[New Wiki Engine]');

                console.log('[Initiating Wiki Manager...]');
                let { categorizedCategory, uncategorizedCategory } =
                    this.#wikiManager.firstInit(
                        this.#wikiCategorizer.categorizedTitle,
                        this.#wikiCategorizer.uncategorizedTitle
                    );

                console.log('[Initiating Wiki Categorizer...]');
                let updateCategoryMap = this.#wikiCategorizer.firstInit(
                    categorizedCategory.id,
                    uncategorizedCategory.id
                );

                console.log('[Initiating DB...]');

                await this.#wikiDB.writeDocs([
                    categorizedCategory,
                    uncategorizedCategory,
                ]);
                await this.#wikiDB.updateCategories(updateCategoryMap);

                return true;
            } else {
                console.log('[Initiating Wiki Manager...]');
                this.#wikiManager.init(DOC_ARR, COMMON_DATA?.typeObj);
                console.log('[Initiating Wiki Categorizer...]');
                const CATEGORIZED_ID = this.#wikiManager.getIdByFullTitle(
                    this.#wikiManager.getFullTitle(
                        'category',
                        this.#wikiCategorizer.categorizedTitle
                    )
                );
                const UNCATEGORIZED_ID = this.#wikiManager.getIdByFullTitle(
                    this.#wikiManager.getFullTitle(
                        'category',
                        this.#wikiCategorizer.uncategorizedTitle
                    )
                );
                this.#wikiCategorizer.init(
                    CATEGORY_ARR,
                    CATEGORIZED_ID,
                    UNCATEGORIZED_ID
                );
                return true;
            }
        } catch (e) {
            throw new Error(e);
        }
    }

    async writeDoc(fullTitle, content, author, comment) {
        try {
            let t = new Date().getTime();

            console.log('write: ' + fullTitle);

            let oldDoc = await this.readDoc(fullTitle);

            console.log('oldDoc: ' + oldDoc.content);

            let newDoc = this.#wikiManager.makeDoc({
                fullTitle,
                content,
                author,
                comment,
            });

            console.log('newDoc: ' + newDoc.content);

            newDoc = this.#wikiCategorizer.checkNoCategory(newDoc);

            let { addCategoryIdArr, removeCategoryIdArr } =
                this.#wikiManager.convertCategoryTitleToId(
                    this.#wikiCategorizer.analyzeDoc(oldDoc, newDoc)
                );

            let {
                createCategoryIdArr,
                deleteCategoryIdArr,
                updateCategoryMap,
            } = this.#wikiCategorizer.categorizeDoc(
                newDoc.id,
                addCategoryIdArr,
                removeCategoryIdArr
            );

            console.log('create');
            console.log(createCategoryIdArr);
            console.log('delete');
            console.log(deleteCategoryIdArr);
            console.log('update');
            console.log(updateCategoryMap);

            let createDocArr =
                this.#wikiManager.createCategoriesByIdArr(createCategoryIdArr);
            let deleteDocArr =
                this.#wikiManager.deleteCategoriesByIdArr(deleteCategoryIdArr);

            console.log(newDoc);

            let writeDocArr = [newDoc, ...createDocArr, ...deleteDocArr];

            console.log('Before saving');

            await this.#wikiDB.writeDocs(writeDocArr);
            await this.#wikiDB.updateCategories(updateCategoryMap);

            console.log(`[Doc Writing Time: ${new Date().getTime() - t}ms]`);

            return true;
        } catch (e) {
            throw new Error(e);
        }
    }

    async readDoc(fullTitle) {
        try {
            let t = new Date().getTime();

            let doc = await this.#wikiDB.readDoc(
                this.#wikiManager.getDoc(fullTitle)
            );

            doc.html = doc.getHTML();

            console.log(`dt: ${new Date().getTime() - t}`);

            return doc;
        } catch (e) {
            throw new Error(e);
        }
    }
}

export default WikiEngine;
