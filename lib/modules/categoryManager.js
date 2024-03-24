import InfoManager from './infoManager.js';
import Chosung from 'chosung';
import Utils from './utils.js';
import DocManager from './docManager.js';
import WikiTranslator from './wikiTranslator.js';

export default class CategoryManager {
    static async createCategoryMarkupByCategorizedArr(categorizedArr) {
        let categoryMarkup = '';

        const categorizedInfoArr = await InfoManager.getInfosByDocIdArr(
            categorizedArr
        );

        // prefix -> titleArr
        const prefixMap = Utils.createPrefixMapByInfoArr(categorizedInfoArr);
        const prefixArr = Utils.moveItemToFirstInArr(
            Array.from(prefixMap.keys()).sort(),
            '분류'
        );

        prefixArr.forEach((prefix) => {
            categoryMarkup += `하위 ${prefix} 문서`;

            const chosungMap = this.createChosungMapByTitleArr(
                prefixMap.get(prefix)
            );

            categoryMarkup += this.createCategoryMarkupByChosungMap(
                chosungMap,
                prefix
            );

            categoryMarkup += '\n----\n';
        });

        return categoryMarkup;
    }

    static createChosungMapByTitleArr(titleArr) {
        // chosung -> titleArr
        const chosungMap = new Map();

        titleArr.forEach((title) => {
            let chosung = Chosung.getChosung(title.toUpperCase().charAt(0));
            if (!Utils.chosungArr.includes(chosung)) {
                chosung = '기타';
            }
            Utils.addItemToArrInMap(chosungMap, chosung, title);
        });

        for (let chosung of chosungMap.keys()) {
            chosungMap.get(chosung).sort();
        }

        return chosungMap;
    }

    static createCategoryMarkupByChosungMap(chosungMap, prefix) {
        // '\n:' + '(categorized)*keys' + ':'
        const middlePart = Array.from(chosungMap.keys()).reduce((prev, chosung) => {
            prev += `(${chosung}\n:([[`;

            if (prefix === '일반') {
                prev += chosungMap.get(chosung).join(']])\n([[');
            } else {
                prev += chosungMap
                    .get(chosung)
                    .map((title) => {
                        return `${title}|${prefix}:${title}`;
                    })
                    .join(']])\n([[');
            }

            prev += ']]):)';

            return prev;
        }, '');

        return '\n:' + middlePart + ':';
    }

    static isCategorized(doc) {
        // The doc is categorized, including the Uncategorized-category.
        const categoryTitleArr = WikiTranslator.getCategoryTitleArr(doc.markup);
        return categoryTitleArr.length !== 0;
    }

    static isUncategorized(doc) {
        // The doc is literally categorized into the Uncategorized-category. It doesn't mean that the doc hasn't any categories.
        const categoryTitleArr = WikiTranslator.getCategoryTitleArr(doc.markup);
        return categoryTitleArr.includes('미분류');
    }

    static getAddCategoryTitleArr(prevDoc, nextDoc) {
        return Utils.getDiffArr(
            WikiTranslator.getCategoryTitleArr(prevDoc.markup),
            WikiTranslator.getCategoryTitleArr(nextDoc.markup)
        );
    }

    static getRemoveCategoryTitleArr(prevDoc, nextDoc) {
        return Utils.getDiffArr(
            WikiTranslator.getCategoryTitleArr(nextDoc.markup),
            WikiTranslator.getCategoryTitleArr(prevDoc.markup)
        );
    }

    static async categorizeDoc(prevDoc, nextDoc) {
        if (!this.isCategorized(nextDoc)) {
            nextDoc.markup = '[#[미분류]]\n' + nextDoc.markup;
        } else if (this.isUncategorized(nextDoc)) {
            throw new Error(
                'A document cannot be categorized into both Uncategorized-category and others at the same time!'
            );
        }

        const addCategoryFullTitleArr = Utils.setPrefixToTitleArr(
            this.getAddCategoryTitleArr(prevDoc, nextDoc),
            '분류'
        );
        const removeCategoryFullTitleArr = Utils.setPrefixToTitleArr(
            this.getRemoveCategoryTitleArr(prevDoc, nextDoc),
            '분류'
        );

        // Adding should be the first.
        await this.addDocToCategories(nextDoc.docId, addCategoryFullTitleArr);
        await this.removeDocFromCategories(
            nextDoc.docId,
            removeCategoryFullTitleArr
        );
    }

    static async addDocToCategories(docId, addCategoryFullTitleArr) {
        if (addCategoryFullTitleArr.length === 0) {
            // No categorise to add
            return true;
        } else {
            const addCategoryDocArr = await InfoManager.getInfosByFullTitleArr(
                addCategoryFullTitleArr
            );
            const addPromiseArr = [];
            const newCategoryIdArr = [];

            addCategoryDocArr.forEach((categoryDoc, idx) => {
                if (categoryDoc === null) {
                    // new category
                    const newCategoryDoc =
                        DocManager.createNewCategoryDocByFullTitle(
                            addCategoryFullTitleArr[idx]
                        );
                    newCategoryIdArr.push(newCategoryDoc.docId);
                    addPromiseArr.push(
                        InfoManager.setInfoByDoc(newCategoryDoc)
                    );
                } else {
                    // existing category
                    categoryDoc.categorizedArr.push(docId);
                    addPromiseArr.push(
                        InfoManager.updateInfoByDoc(categoryDoc)
                    );
                }
            });

            if (newCategoryIdArr.length !== 0) {
                // Add all new categories into the Uncategorized-category
                const uncategorizedInfo =
                    await InfoManager.getInfosByFullTitleArr('분류:미분류');
                uncategorizedInfo.categorizedArr.push(...newCategoryIdArr);
                addPromiseArr.push(
                    InfoManager.updateInfoByDoc(uncategorizedInfo)
                );
            }

            return await Promise.allSettled(addPromiseArr);
        }
    }

    static async removeDocFromCategories(docId, removeCategoryFullTitleArr) {
        if (removeCategoryFullTitleArr.length === 0) {
            // No categorise to remove.
            return true;
        } else {
            const [removeInfoMap, deleteInfoArr] =
                await this.analyzeRemovingDocFromCategories(
                    docId,
                    removeCategoryFullTitleArr
                );

            const removePromiseArr = [];
            removeInfoMap.keys().forEach((key) => {
                removePromiseArr.push(
                    InfoManager.setInfoByDoc(removeInfoMap.get(key))
                );
            });

            deleteInfoArr.forEach((info) => {
                const nextDoc = DocManager.createNextDocByPrevDoc(
                    info,
                    { name: 'system' },
                    '',
                    '분류 삭제'
                );
                removePromiseArr.push(DocManager.setNextDocByDoc(nextDoc));
            });

            return await Promise.allSettled(removePromiseArr);
        }
    }

    static async analyzeRemovingDocFromCategories(
        docId,
        categoryFullTitleArr,
        removeInfoMap = new Map(),
        deleteInfoArr = []
    ) {
        for (let categoryFullTitle of categoryFullTitleArr) {
            await this.analyzeRemovingDocFromCategory(
                docId,
                categoryFullTitle,
                removeInfoMap,
                deleteInfoArr
            );
        }
        return [removeInfoMap, deleteInfoArr];
    }

    static async analyzeRemovingDocFromCategory(
        docId,
        categoryFullTitle,
        removeInfoMap,
        deleteInfoArr
    ) {
        let categoryInfo;
        if (!removeInfoMap.has(categoryFullTitle)) {
            categoryInfo = await InfoManager.getInfoByFullTitle(
                categoryFullTitle
            );
            removeInfoMap.set(categoryFullTitle, categoryInfo);
        } else {
            categoryInfo = removeInfoMap.get(categoryFullTitle);
        }

        if (categoryInfo.categorizedArr.length === 1) {
            // The only doc categorized into the category.
            removeInfoMap.delete(categoryFullTitle);
            deleteInfoArr.push(categoryInfo);

            const categoryHist = await HistManager.getHistByDocId(
                categoryInfo.docId
            );
            const categoryFullTitleArr = Utils.setPrefixToTitleArr(
                WikiTranslator.getCategoryTitleArr(categoryHist.markup),
                '분류'
            );
            return await this.analyzeRemovingDocFromCategories(
                categoryInfo.docId,
                categoryFullTitleArr,
                removeInfoMap,
                deleteInfoArr
            );
        } else {
            // It is not the only doc.
            categoryInfo.categorizedArr.delete(docId);
            return [removeInfoMap, deleteInfoArr];
        }
    }
}
