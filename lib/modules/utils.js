import Translator from 'ken-markup';

export class WikiComparator {

}

export class WikiTranslator {

    static categoryReg = /\[#\[(.+)]]/g;

    static toCategory(content) {
        let categoryTitleArr = [];

        content = content.replaceAll(this.categoryReg, (match, categoryTitle) => {
            categoryTitleArr = [...categoryTitleArr, ...categoryTitle.split(/(?<!\\)\|/)];
            return '';
        });


        let categoryContent = '분류: ' + categoryTitleArr.map(title => {
            return `<a href="/r/분류:${title}">${title}</a>`;
        }).join(' | ') + '<hr />' + content;


        if (categoryTitleArr.length === 0) {
            categoryContent = content;
        }

        return {
            content: categoryContent,
            categoryTitleArr: categoryTitleArr,
        };
    }

    static toNormal(content) {
        return content;
    }

    static translate(content) {

        content = Translator.translate(content).content;

        let categoryData = this.toCategory(content);
        content = categoryData.content;

        content = this.toNormal(content);

        return content;
    }

}