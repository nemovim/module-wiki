import type { Info } from '../types/info';
import type { Doc, DocId } from '../types/doc';

import InfoController from '../controllers/info';
import HistController from '../controllers/hist';

import WikiTranslator from '../utils/translator';
import GeneralUtils from '../utils/general';
import TitleUtils from '../utils/title';
import MarkupUtils from '../utils/markup';

import DocManager from './doc';
import AuthorityManager from './authority';

export default class CategoryManager {
    static async createCategoryMarkupByCategorizedArr(categorizedArr: DocId[]): Promise<string> {
        const categorizedInfoArr = await InfoController.getInfosByDocIdArr(
            categorizedArr
        );

        if (categorizedInfoArr.includes(null)) throw new Error("Nonexistent doc is categorized!");

        const categorizedFullTitleArr = categorizedInfoArr.map(info => (info as Info).fullTitle);

        return MarkupUtils.createAlignedMarkupByFullTitleArr(categorizedFullTitleArr, '하위');
    }

    // static isCategorized(doc) {
    //     // The doc is categorized, including the Uncategorized-category.
    //     const categoryTitleArr = WikiTranslator.getCategoryTitleArr(doc.markup);
    //     return categoryTitleArr.length !== 0;
    // }

    // static isUncategorized(doc) {
    //     // The doc is literally categorized into the Uncategorized-category. It doesn't mean that the doc doesn't have any categories.
    //     const categoryTitleArr = WikiTranslator.getCategoryTitleArr(doc.markup);
    //     return categoryTitleArr.includes('미분류');
    // }

    static getAddCategoryTitleArr(prevMarkup: string | null, nextMarkup: string): string[] {
        if (prevMarkup === null) {
            return WikiTranslator.getCategoryTitleArr(nextMarkup);
        } else {
            return GeneralUtils.getDiffArr(
                WikiTranslator.getCategoryTitleArr(prevMarkup),
                WikiTranslator.getCategoryTitleArr(nextMarkup)
            );
        }
    }

    static getRemoveCategoryTitleArr(prevMarkup: string | null, nextMarkup: string): string[] {
        if (prevMarkup === null) {
            return [];
        } else {
            return GeneralUtils.getDiffArr(
                WikiTranslator.getCategoryTitleArr(nextMarkup),
                WikiTranslator.getCategoryTitleArr(prevMarkup)
            );
        }
    }

    static async categorizeDoc(prevDoc: Partial<Doc> & { markup: string, docId: DocId } | null, nextDoc: Partial<Doc> & { markup: string, docId: DocId }, isDeleted = false): Promise<void> {

        const categoryTitleArr = WikiTranslator.getCategoryTitleArr(
            nextDoc.markup
        );

        if (categoryTitleArr.length === 0) {
            if (!isDeleted) {
                nextDoc.markup = '[#[미분류]]\n' + nextDoc.markup;
            }
        } else if (
            categoryTitleArr.includes('미분류') &&
            categoryTitleArr.length >= 2
        ) {
            throw new Error(
                'A document cannot be categorized into both Uncategorized-category and others at the same time!'
            );
        }

        const addCategoryFullTitleArr = TitleUtils.setPrefixToTitleArr(
            this.getAddCategoryTitleArr(prevDoc?.markup || null, nextDoc.markup),
            '분류'
        );
        const removeCategoryFullTitleArr = TitleUtils.setPrefixToTitleArr(
            this.getRemoveCategoryTitleArr(prevDoc?.markup || null, nextDoc.markup),
            '분류'
        );

        // Adding should be the first.
        await this.addDocToCategories(nextDoc.docId, addCategoryFullTitleArr);
        await this.removeDocFromCategories(nextDoc.docId, removeCategoryFullTitleArr);
    }

    static async addDocToCategories(docId: DocId, addCategoryFullTitleArr: string[]) {
        if (addCategoryFullTitleArr.length === 0) {
            // No categorise to add
            return true;
        } else {
            const addCategoryInfoArr = await InfoController.getInfosByFullTitleArr(
                addCategoryFullTitleArr
            );
            console.log(addCategoryInfoArr);
            const addPromiseArr: Promise<any>[] = [];
            const newCategoryIdArr: DocId[] = [];

            for (let idx=0; idx<addCategoryInfoArr.length; idx++) {
                const categoryInfo = addCategoryInfoArr[idx];
                if (categoryInfo === null) {
                    // new category
                    const newCategoryDoc =
                        DocManager.createNewDocByFullTitle(
                            addCategoryFullTitleArr[idx],
                            AuthorityManager.getSystemUser(),
                            {
                                categorizedArr: [docId]
                            }
                        );
                    newCategoryIdArr.push(newCategoryDoc.docId);
                    addPromiseArr.push(
                        DocManager.setNewDocByDoc(newCategoryDoc)
                    );
                } else if (categoryInfo.state === 'deleted') {
                    // deleted category
                    const categoryDoc =
                        DocManager.createNextDocByPrevInfo(categoryInfo,
                            AuthorityManager.getSystemUser(),
                            '[#[미분류]]',
                            '분류 생성',
                        );
                    categoryDoc.categorizedArr.push(docId);
                    newCategoryIdArr.push(categoryDoc.docId);
                    addPromiseArr.push(
                        DocManager.setDeletedDocByDoc(categoryDoc)
                    );
                } else {
                    // existing category
                    categoryInfo.categorizedArr.push(docId);
                    addPromiseArr.push(
                        InfoController.updateInfoByDoc(categoryInfo)
                    );
                }
            };

            if (newCategoryIdArr.length !== 0) {
                // Add all new categories into the Uncategorized-category
                const uncategorizedInfo = await InfoController.getInfoByFullTitle(
                    '분류:미분류'
                );
                if (uncategorizedInfo === null) throw new Error('Uncategorized category must exist!');
                uncategorizedInfo.categorizedArr.push(...newCategoryIdArr);
                addPromiseArr.push(
                    InfoController.updateInfoByDoc(uncategorizedInfo)
                );
            }

            for (let promise of addPromiseArr) {
                await promise;
            }
        }
    }

    static async removeDocFromCategories(docId: DocId, removeCategoryFullTitleArr: string[]): Promise<void> {
        if (removeCategoryFullTitleArr.length === 0) {
            // No categorise to remove.
        } else {
            const [removeInfoMap, deleteInfoArr] =
                await this.analyzeRemovingDocFromCategories(
                    docId,
                    removeCategoryFullTitleArr
                );

            const removePromiseArr: Promise<any>[] = [];
            for (let [key, value] of removeInfoMap) {
                const removeInfo = removeInfoMap.get(key) as Info;
                removePromiseArr.push(
                    InfoController.updateInfoByDoc(removeInfo)
                );
            }

            for (let info of deleteInfoArr) {
                await DocManager.deleteDocByInfo(
                    info,
                    AuthorityManager.getSystemUser(),
                    '분류 삭제',
                );
            }

            let i =0;
            for (let promise of removePromiseArr) {
                i++;
                await promise;
                if (i > 2) {
                    throw new Error('kiyao');
                }
            }
        }
    }

    // RemoveInfoMap: Map<DocId, Info> = CategoryInfo whose categorizedArr needs to be updated.
    // DeleteInfoArr: Info[] = CategoryInfo which will be deleted.
    static async analyzeRemovingDocFromCategories(
        docId: DocId,
        categoryFullTitleArr: string[],
        removeInfoMap = new Map<string, Info>(),
        deleteInfoArr: Info[] = []
    ): Promise<[Map<string, Info>, Info[]]> {
        for (let categoryFullTitle of categoryFullTitleArr) {
            [removeInfoMap, deleteInfoArr] =
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
        docId: DocId,
        categoryFullTitle: string,
        removeInfoMap: Map<string, Info>,
        deleteInfoArr: Info[]
    ): Promise<[Map<string, Info>, Info[]]> {
        let categoryInfo: Info;
        if (!removeInfoMap.has(categoryFullTitle)) {
            const tempInfo = await InfoController.getInfoByFullTitle(
                categoryFullTitle
            );
            if (tempInfo === null) throw new Error('The category does not exist!');
            categoryInfo = tempInfo;
            removeInfoMap.set(categoryFullTitle, categoryInfo);
        } else {
            categoryInfo = removeInfoMap.get(categoryFullTitle) as Info;
        }

        if (categoryInfo.categorizedArr.length === 1 && categoryInfo.fullTitle !== '분류:미분류' && categoryInfo.fullTitle !== '분류:분류') {
            // This is the only doc categorized into the category.

            removeInfoMap.delete(categoryFullTitle);
            categoryInfo.categorizedArr = [];
            deleteInfoArr.push(categoryInfo);

            const categoryHist = await HistController.getHistByDocId(
                categoryInfo.docId
            );
            if (categoryHist === null) throw new Error('The category does not exist!');

            const categoryFullTitleArr = TitleUtils.setPrefixToTitleArr(
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
            categoryInfo.categorizedArr.splice(
                categoryInfo.categorizedArr.indexOf(docId),
                1
            );
            return [removeInfoMap, deleteInfoArr];
        }
    }
}
