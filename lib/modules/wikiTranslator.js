import Translator from 'ken-markup';

export default class WikiTranslator {
    static categoryReg = /(?<!\\)\[#\[(.+?)]](?:<br>)?/g;

    static getCategoryTitleArr(_content) {
        let categoryTitleArr = [];

        _content.matchAll(this.categoryReg).forEach((match) => {
            categoryTitleArr = [
                ...categoryTitleArr,
                ...match[1].split(/(?<!\\)\|/),
            ];
        });

        return categoryTitleArr;
    }

    static toCategory(_content) {
        let content = _content.replaceAll(this.categoryReg, '');
        const categoryTitleArr = this.getCategoryTitleArr(_content);

        if (categoryTitleArr.length === 0) {
            return content;
        } else {
            return (
                '분류: ' +
                categoryTitleArr
                    .map((title) => {
                        return `<a href="/r/분류:${title}">${title}</a>`;
                    })
                    .join(' | ') +
                `<hr />${content}`
            );
        }
    }

    static toNormal(content) {
        const categoryReg = /\\(\[#\[(.+)]])/g;
        content = content.replaceAll(categoryReg, '$1');
        return content;
    }

    static translate(_content) {
        let content = _content.replaceAll(/\r\n/g, '\n');
        content = Translator.translate(content);
        content = this.toCategory(content);
        content = this.toNormal(content);
        return content;
    }
}
