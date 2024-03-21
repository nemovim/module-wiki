class WikiCategorizer {
    #categorizedMap;
    #categoryMap;

    categorizedTitle;
    categorizedId;
    uncategorizedTitle;
    uncategorizedId;

    constructor() {
        this.#categorizedMap = new Map();
        this.#categoryMap = new Map();
        this.categorizedTitle = process.env.CATEGORIZED_TITLE;
        this.uncategorizedTitle = process.env.UNCATEGORIZED_TITLE;
    }

    firstInit(_categorizedId, _uncategorizedId) {
        this.categorizedId = _categorizedId;
        this.uncategorizedId = _uncategorizedId;
        this.#categorizedMap.set(this.categorizedId, [this.uncategorizedId]);
        this.#categorizedMap.set(this.uncategorizedId, []);
        this.#categoryMap.set(this.uncategorizedId, [this.categorizedId]);
        return this.#categorizedMap;
    }

    init(categoryArr, _categorizedId, _uncategorizedId) {
        this.categorizedId = _categorizedId;
        this.uncategorizedId = _uncategorizedId;

        categoryArr.forEach((category) => {
            this.#categorizedMap.set(category.id, category.categorizedArr);
            category.categorizedArr.forEach((categorizedId) => {
                if (this.#categoryMap.has(categorizedId)) {
                    let categoryArr = this.#categoryMap.get(categorizedId);
                    categoryArr.push(category.id);
                    this.#categoryMap.set(categorizedId, categoryArr);
                } else {
                    this.#categoryMap.set(categorizedId, [category.id]);
                }
            });
        });
    }
}
