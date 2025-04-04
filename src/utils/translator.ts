import Translator from 'ken-markup';
import TitleUtils from './title.js';
import GeneralUtils from './general.js';

export default class WikiTranslator {
    static categoryReg: RegExp;
    static externalAnchorReg: RegExp;

    static initTranslator(): void {
        this.categoryReg = Translator.createRegExp(/\[#\[/, /(.+?)/, /]](?:\n)?/);
        this.externalAnchorReg = Translator.createRegExp(/\[(https?)\[/, /(.+?)/, /\]\]/);
        Translator.parseAnchorAttributes = (link: string, name?: string) => {
            if (!name) name = link;
            let title = link;
            link = link.replaceAll(/(?<!\\)#/g, '<#>');
            return [title, link, name];
        };
    }

    static parseAnchorLink(content: string): string {
        content = content.replace(/(?<=<a title="(?:.(?!<\/a>))+?" href=")(.+?)(?=">.+?<\/a>)/g, (captured) => {
            const splittedHref = captured.split('<#>');
            if (splittedHref.length >= 2) {
                const hash = splittedHref.splice(splittedHref.length - 1, 1)[0];
                console.log(splittedHref)
                return "/r/" + TitleUtils.encodeFullTitle(splittedHref.join('#')) + '#' + TitleUtils.encodeFullTitle(hash);
            } else {
                return "/r/" + TitleUtils.encodeFullTitle(GeneralUtils.normalizeHtml(captured));
            }
        });

        content = content.replace(/(?<=<a class="external-link" title="(?:.(?!<\/a>))+?" href=")(.+?)(?=">.+?<\/a>)/g, (captured) => {
            return GeneralUtils.normalizeHtml(captured);
        });

        return content;
    }

    static toExternalAnchor(content: string): string {
        return content.replaceAll(
            this.externalAnchorReg,
            (_match, protocol, captured) => {
                let [parsedTitle, parsedLink, parsedName] = Translator.parseAnchorAttributes(captured.split(Translator.splitReg)[0].trim(), captured.split(Translator.splitReg).slice(1).join('|').trim());

                if (parsedName === parsedLink) {
                    parsedName = `${protocol}:\\/\\/${parsedName}`;
                }

                return `<a class="external-link" title="${protocol}:\\/\\/${parsedTitle}" href="${protocol}:\\/\\/${parsedLink}">${parsedName}</a>`;
            }
        );
    }

    static getAnchorFullTitleArr(content: string): string[] {
        const anchorFullTitleSet = new Set<string>();

        for (let match of content.matchAll(Translator.anchorReg)) {
            const fullTitleWithHashAndEscape = match[1].split(Translator.splitReg)[0].trim()

            const fullTitleWithHash = Translator.toUnescape(fullTitleWithHashAndEscape.replaceAll(/(?<!\\)#/g, '<#>'));

            const splittedFullTitle = fullTitleWithHash.split('<#>');

            let fullTitle = fullTitleWithHash;
            if (splittedFullTitle.length >= 2) {
                fullTitle = splittedFullTitle.slice(0, splittedFullTitle.length-1).join('#');
            }
            anchorFullTitleSet.add(fullTitle);
        }

        return Array.from(anchorFullTitleSet);
    }

    static getCategoryTitleArr(content: string): string[] {
        const categoryTitleSet = new Set<string>();
        for (let match of content.matchAll(this.categoryReg)) {
            match[1].split(Translator.splitReg).map(title => categoryTitleSet.add(title.trim()));
        }
        return Array.from(categoryTitleSet);
    }

    static toCategory(content: string): string {
        const categoryTitleArr = this.getCategoryTitleArr(content);
        content = content.replaceAll(this.categoryReg, '');

        if (categoryTitleArr.length === 0) {
            return '분류: <a title="분류:미분류" href="분류:미분류">미분류</a><hr/>' + content;
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


    static toNormal(content: string): string {
        // const categoryReg = /\\(\[#\[(.+)]])/g;
        // content = content.replaceAll(categoryReg, '$1');
        return content;
    }

    static toIgnore(content: string): string {
        // const specialAnchorReg = /(\[@\[|\]\])/g;
        // const categoryReg = /(\[#\[|\]\])/g;
        // content = content.replaceAll(categoryReg, '\\$1');
        // content = content.replaceAll(specialAnchorReg, '\\$1');
        return content;
    }

    static toEscape(content: string): string {
        return Translator.toEscape(content);
    }

    static translate(content: string, fullTitle?: string): string {
        content = content.replaceAll(/\r\n/g, '\n');
        let customFunc = (_content: string) => this.toExternalAnchor(_content);
        // If fullTitle is undefined, do not translate the wiki-kind grammar such as category.
        if (fullTitle && fullTitle !== '분류:분류') {
            // Ignore Category for the root category.
            customFunc = (_content) => {
                _content = this.toExternalAnchor(_content);
                _content = this.toCategory(_content)
                return _content;
            }
        }
        content = Translator.translate(content, false, customFunc);
        content = this.parseAnchorLink(content); // This must work after the category translation
        return content;
    }
}
