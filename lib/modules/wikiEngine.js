import WikiDB from './wikiDB.js';
import WikiManager from './wikiManager.js';
import WikiLogger from './wikiLogger.js';
import WikiUser from './wikiUser.js';
import HangulSearcher from 'hangul-search';
import Diff from 'diff';

export default class WikiEngine {
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


    async compareDoc(fullTitle, oldHist, newHist) {
        let data = await Promise.allSettled([await this.readDoc(fullTitle, oldHist), await this.readDoc(fullTitle, newHist)]);
        let oldDoc = data[0].value
        let newDoc = data[1].value
        oldDoc.fullTitle = fullTitle;
        newDoc.fullTitle = fullTitle;

        return Diff.diffWords(oldDoc.content, newDoc.content);
    }

    getInfoArr() {
        return this.#wikiManager.getInfoArr();
    }

    searchDoc(searchWord) {
        let hangulSearcher = new HangulSearcher(this.#wikiManager.getInfoArr());
        let searchResultArr = hangulSearcher.search(searchWord, 0.2);
        if (searchResultArr.length !== 0 && searchWord === searchResultArr[0].title) {
            // Exact match
            return {
                status: 'exact',
                result: searchWord
            }
        } else {
            return {
                status: 'search',
                result: searchResultArr
            }
        }
    }

    async readUser(id) {
        let user = new WikiUser(this.#wikiDB.readUser(id));
    }
}