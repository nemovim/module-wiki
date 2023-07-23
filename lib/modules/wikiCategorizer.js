class WikiCategorizer {
    #categoryMap;

    constructor() {
        this.#categoryMap = new Map();
    }

    init(docArray) {
        docArray.forEach(doc => {
            if (doc?.categorized != undefined) {
                this.#categoryMap.set(doc._id, doc.categorized);
            }
        });
    }

    categorize(doc) {
        return {
            updateCategoryMap: new Map(),
            newCategoryMap: new Map(),
        };
    }
}

export default WikiCategorizer;