import CategoryManager from './categoryManager';
import DocManager from './docManager';
import WikiTranslator from './wikiTranslator';

export default class WikiManager {
    static async createHTML(markup, type, categorizedArr) {
        if (type === 'general') {
            return WikiTranslator.translate(markup);
        } else if (type === 'category') {
            const categoryMarkup =
                await CategoryManager.createCategoryMarkupByCategorizedArr(
                    categorizedArr
                );
            return WikiTranslator.translate(markup + categoryMarkup);
        }
    }

    static async readDocByFullTitle(fullTitle, user, revision = -1) {
        if (AuthorityManager.canRead(info, user.authorityObj)) {
            const doc = await DocManager.getDocByFullTitle(fullTitle, revision);
            doc.html = await this.createHTML(
                doc.markup,
                doc.type,
                doc.categorizedArr
            );
            return doc;
        } else {
            throw new Error('Cannot Read');
        }
    }

    static translateMakrupToHTML(markup) {
        return WikiTranslator.translate(markup);
    }

    static async writeDocByFullTitle(fullTitle, user, markup, comment) {
        if (AuthorityManager.canWrite(doc, user.authorityObj)) {
            const prevDoc = await DocManager.getDocByFullTitle(
                fullTitle,
                user,
                -1
            );

            if (prevDoc === null) {
                // write new doc
                const newDoc = DocManager.createNewGeneralDocByFullTitle(
                    fullTitle,
                    user,
                    markup,
                    comment
                );

                await CategoryManager.categorizeDoc(prevDoc, newDoc);
                return await DocManager.setNewDocByDoc(newDoc);
            } else {
                // write nextDoc
                const nextDoc = DocManager.createNextDocByPrevDoc(
                    prevDoc,
                    user,
                    markup,
                    comment
                );

                await CategoryManager.categorizeDoc(prevDoc, nextDoc);
                return await DocManager.setNextDocByDoc(nextDoc);
            }
        } else {
            throw new Error('Cannot Write');
        }
    }
}
