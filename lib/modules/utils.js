import Translator from 'ken-markup';

export class WikiComparator {}

export class WikiTranslator {
    static categoryReg = /(?<!\\)\[#\[(.+?)]](?:<br>)?/g;

    static toCategory(content) {
        let categoryTitleArr = [];

        content = content.replaceAll(
            this.categoryReg,
            (match, categoryTitle) => {
                categoryTitleArr = [
                    ...categoryTitleArr,
                    ...categoryTitle.split(/(?<!\\)\|/),
                ];
                return '';
            }
        );

        const CATEGORY_TYPE = JSON.parse(process.env.TYPE_STRING).category;

        let categoryContent =
            CATEGORY_TYPE +
            ': ' +
            categoryTitleArr
                .map((title) => {
                    return `<a href="/r/${CATEGORY_TYPE}:${title}">${title}</a>`;
                })
                .join(' | ') +
            '<hr />' +
            content;

        if (categoryTitleArr.length === 0) {
            categoryContent = content;
        }

        return {
            content: categoryContent,
            categoryTitleArr: categoryTitleArr,
        };
    }

    static toNormal(content) {
        const categoryReg = /\\(\[#\[(.+)]])/g;
        content = content.replaceAll(categoryReg, '$1');
        return content;
    }

    static translate(content) {
        content = Translator.translate(content);

        let categoryData = this.toCategory(content);
        content = categoryData.content;

        content = this.toNormal(content);

        return content;
    }
}
