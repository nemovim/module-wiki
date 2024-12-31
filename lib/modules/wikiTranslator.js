import Translator from 'ken-markup';
import Utils from './utils.js';

export default class WikiTranslator {
    static categoryReg = /(?<!\\)\[#\[(.+?)]](?:<br>)?/g;

    static parseAnchorLink(_content) {
        return _content.replaceAll(/(?<=<a title=".+?" href=")(.+?)(?=">.+?<\/a>)/g, (captured) => {
            return "/r/" + Utils.encodeFullTitle(captured);
        });
    }

    static getCategoryTitleArr(_content) {
        const categoryTitleArr = [];

        for (let match of _content.matchAll(this.categoryReg)) {
            categoryTitleArr.push(...match[1].split(/(?<!\\)\|/));
        }

        return categoryTitleArr;
    }

    static toCategory(_content) {
        let content = _content.replaceAll(this.categoryReg, '');
        const categoryTitleArr = this.getCategoryTitleArr(_content);

        if (categoryTitleArr.length === 0) {
            // return '분류: <a href="/r/분류:미분류">미분류</a><hr/>' + content;
            return content;
        } else {
            return (
                '분류: ' +
                categoryTitleArr
                    .map((title) => {
                        return `<a title="분류:${title}" href="분류:${title}">${title}</a>`;
                    })
                    .join(' | ') +
                `<hr />${content}`
            );
        }
    }

    static toNormal(_content) {
        const categoryReg = /\\(\[#\[(.+)]])/g;
        let content = _content.replaceAll(categoryReg, '$1');
        return content;
    }

    static translate(_content) {
        let content = _content.replaceAll(/\r\n/g, '\n');
        content = Translator.translate(content);
        content = this.toCategory(content);
        content = this.parseAnchorLink(content); // This must work after the category translation
        content = this.toNormal(content);
        return content;
    }
}
