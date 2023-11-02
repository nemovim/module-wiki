import { WikiTranslator } from './utils.js';

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
        this.#categoryMap.set(this.uncategorizedId, [this.categorizeId]);
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

    checkNoCategory(doc) {
        if (
            WikiTranslator.toCategory(doc.content).categoryTitleArr.length === 0
        ) {
            doc.content =
                '[#[' + this.uncategorizedTitle + ']]\n' + doc.content;
        }
        return doc;
    }

    analyzeDoc(oldDoc, newDoc) {
        let oldCategoryTitleArr = this.getCategoryTitleArr(oldDoc);
        let newCategoryTitleArr = this.getCategoryTitleArr(newDoc);

        if (
            newCategoryTitleArr.length > 1 &&
            newCategoryTitleArr.indexOf(this.uncategorizedTitle) !== -1
        ) {
            // It's impossible.
            throw new Error(
                'A document cannot be categorized both uncategorized and other categories simultaneously.'
            );
        }

        let addCategoryTitleArr = this.findNewCategories(
            oldCategoryTitleArr,
            newCategoryTitleArr
        );

        console.log('new');
        console.log(newCategoryTitleArr);
        console.log('old');
        console.log(oldCategoryTitleArr);

        let removeCategoryTitleArr = this.findNewCategories(
            newCategoryTitleArr,
            oldCategoryTitleArr
        );

        return {
            addCategoryTitleArr,
            removeCategoryTitleArr,
        };
    }

    getCategoryTitleArr(doc) {
        return WikiTranslator.toCategory(doc.content).categoryTitleArr;
    }

    findNewCategories(oldArr, newArr) {
        return newArr.reduce((newItems, item) => {
            if (oldArr.indexOf(item) === -1) {
                newItems.push(item);
            }
            return newItems;
        }, []);
    }

    categorizeDoc(docId, addCategoryIdArr, removeCategoryIdArr) {
        let updateCategoryIdSet = new Set();

        addCategoryIdArr.forEach((categoryId) => {
            updateCategoryIdSet = new Set([
                ...updateCategoryIdSet,
                ...this.addDocToCategory(docId, categoryId),
            ]);
        });

        removeCategoryIdArr.forEach((categoryId) => {
            updateCategoryIdSet = new Set([
                ...updateCategoryIdSet,
                ...this.removeDocToCategory(docId, categoryId),
            ]);
        });

        console.log('updateCategoryIdSet');
        console.log(updateCategoryIdSet);

        let createCategoryIdArr = [];
        let deleteCategoryIdArr = [];

        let updateCategoryMap = new Map();

        updateCategoryIdSet.forEach((categoryId) => {
            if (this.isDeleted(categoryId)) {
                deleteCategoryIdArr.push(categoryId);
            }
            if (this.isCreated(categoryId)) {
                createCategoryIdArr.push(categoryId);
            }
            updateCategoryMap.set(
                categoryId,
                this.#categorizedMap.get(categoryId)
            );
        });

        console.log('UpdateCategoryMap');
        console.log(updateCategoryMap);

        return {
            createCategoryIdArr,
            deleteCategoryIdArr,
            updateCategoryMap,
        };
    }

    isCreated(categoryId) {
        return (
            this.#categorizedMap.get(categoryId).length === 1 &&
            categoryId !== this.categorizedId &&
            categoryId !== this.uncategorizedId
        );
    }

    addDocToCategory(docId, categoryId) {
        let exists = (this.#categorizedMap.get(categoryId) || []).length !== 0;
        if (exists) {
            return this.addDocToExistCategory(docId, categoryId);
        } else {
            // New category. Maybe it has been deleted.
            return this.addDocToNewCategory(docId, categoryId);
        }
    }

    addDocToNewCategory(docId, categoryId) {
        this.#categorizedMap.set(categoryId, [docId]);

        let categoryArr = this.#categoryMap.get(docId) || [];
        categoryArr.push(categoryId);
        this.#categoryMap.set(docId,categoryArr);

        this.addDocToExistCategory(categoryId, this.uncategorizedId);
        return [categoryId, this.uncategorizedId];
    }

    addDocToExistCategory(docId, categoryId) {
        // let updatedCategorizedArr = this.#categorizedMap.get(categoryId) || []; // This OR is only for uncategorized category.
        let updatedCategorizedArr = this.#categorizedMap.get(categoryId);
        updatedCategorizedArr.push(docId);
        this.#categorizedMap.set(categoryId, updatedCategorizedArr);

        let categoryArr = this.#categoryMap.get(docId) || [];
        categoryArr.push(categoryId);
        this.#categoryMap.set(docId,categoryArr);

        return [categoryId];
    }

    isDeleted(categoryId) {
        return (
            this.#categorizedMap.get(categoryId).length === 0 &&
            categoryId !== this.categorizedId &&
            categoryId !== this.uncategorizedId
        );
    }

    removeDocToCategory(docId, categoryId) {
        let categorizedArr = this.#categorizedMap.get(categoryId);
        categorizedArr.splice(categorizedArr.indexOf(docId), 1);
        this.#categorizedMap.set(categoryId, categorizedArr);

        let categoryArr = this.#categoryMap.get(docId);
        categoryArr.splice(categoryArr.indexOf(categoryId), 1);
        this.#categoryMap.set(docId, categoryArr);

        if (this.isDeleted(categoryId)) {
            let updateCategoryIdArr = this.removeCategory(categoryId);
            return [categoryId, ...updateCategoryIdArr];
        } else {
            return [categoryId];
        }
    }

    removeCategory(categoryId) {
        let highCategoryArr = this.#categoryMap.get(categoryId);
        return highCategoryArr.reduce((updateCategoryArr, highCategoryId) => {
            updateCategoryArr = [
                ...updateCategoryArr,
                ...this.removeDocToCategory(categoryId, highCategoryId),
            ];
            return updateCategoryArr;
        }, []);
    }

    // addDocToCategory(docId, categoryTitle) {
    //     if (this.isNew(categoryTitle)) {
    //         return this.addDocToNewCategory(docId, categoryTitle);
    //     } else {
    //         const CATEGORY_ID = this.#idMap.get(categoryTitle);

    //         if (this.#categorizedMap.get(CATEGORY_ID).indexOf(docId) === -1) {
    //             return this.addDocToExistCategory(docId, CATEGORY_ID);
    //         } else {
    //             return {
    //                 newCategoryArr: [],
    //                 updateCategoryMap: new Map(),
    //             };
    //         }
    //     }
    // }

    // addDocToNewCategory(docId, categoryTitle) {
    //     let returnObj = {
    //         newCategoryArr: [],
    //         updateCategoryMap: new Map(),
    //     };

    //     returnObj.newCategoryArr.push(
    //         this.createDoc(categoryTitle, '', 'system', '', [docId])
    //     );

    //     if (categoryTitle !== this.#categorizedName) {
    //         let highCategory = this.#uncategorizedName;
    //         if (categoryTitle === this.#uncategorizedName) {
    //             highCategory = this.#categorizedName;
    //         }

    //         let result = this.addDocToCategory(newCategory.id, highCategory);

    //         returnObj.newCategoryArr = [
    //             ...returnObj.newCategoryArr,
    //             ...result.newCategoryArr,
    //         ];
    //         returnObj.updateCategoryMap = new Map([
    //             ...result.updateCategoryMap,
    //         ]);
    //     }

    //     return resultObj;
    // }

    // addDocToExistCategory(docId, categoryId) {
    //     let updateCategoryMap = new Map();
    //     let updateCategorizedArr = this.#categorizedMap
    //         .get(categoryId)
    //         .push(docId);

    //     this.#categorizedMap.set(categoryId, updateCategorizedArr);
    //     updateCategoryMap.set(categoryId, updateCategorizedArr);

    //     return {
    //         newCategoryArr: [],
    //         updateCategoryMap: updateCategoryMap,
    //     };
    // }
}

export default WikiCategorizer;
