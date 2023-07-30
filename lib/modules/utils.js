import Translator from 'ken-markup';

export class WikiComparator {

}

export class WikiTranslator {

    static categoryReg = /./g;

    static toCategory(content) {
        let categoryArray = [];

        content = content.replaceAll(this.categoryReg, (match, categoryTitle) => {
            categoryArray.push(categoryTitle);
            return '';
        });

        return {
            content: content,
            categoryArray: categoryArray,
        };
    }

    static toNormal(content) {
        return content;
    }

    static translate(content) {

        let categoryData = this.toCategory(content);
        content = categoryData.content;

        content = this.toNormal(content);
        return Translator.translate(content);
    }

}