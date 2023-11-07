import { WikiTranslator } from './utils';
import Chosung from 'chosung';

class WikiDoc {
    id;
    title;
    fullTitle;
    type;
    state;
    history;
    content;
    author;
    comment;
    authorityObj;
    editedTime;
    categorized;

    constructor(param) {
        this.id = param?.id || '';
        this.title = param?.title || '';
        this.type = param?.type || '';
        this.state = param?.state || '';
        this.content = param?.content || '';
        this.author = param?.author || '???';
        this.comment = param?.comment || '';
        this.history = param?.history || -1;
        this.authorityObj =
            param?.authorityObj ||
            (this.type === 'category'
                ? {
                      read: 1,
                      write: 1,
                      update: 100,
                      delete: 100,
                  }
                : {
                      read: 1,
                      write: 1,
                      update: 1,
                      delete: 1,
                  });
        this.editedTime = param?.editedTime || -1;
        this.categorized = new Map();
    }

    getText() {
        return this.content;
    }

    getHTML() {
        let mainContent = this.content;
        let categoryContent = '';

        if (this.type === 'category') {
            categoryContent = this.getCategoryContent();
        }

        return WikiTranslator.translate(mainContent + categoryContent);
    }

    getDocJSON() {
        return {
            id: this.id,
            type: this.type,
            state: this.state,
            title: this.title,
            history: this.history,
            authorityObj: this.authorityObj,
        };
    }

    getHistoryJSON() {
        return {
            id: this.id,
            history: this.history,
            content: this.content,
            author: this.author,
            comment: this.comment,
        };
    }

    getCategoryContent() {
        console.log(this.categorized);

        let categoryContent = '';
        let docCategorizedContent = this.getCategorizedContent(
            this.getCategorizedMap(this.categorized.get('doc'))
        );
        let categoryCategorizedContent = this.getCategorizedContent(
            this.getCategorizedMap(this.categorized.get('category')),
            true
        );

        if (categoryCategorizedContent) {
            categoryContent += '하위 분류' + categoryCategorizedContent;
            if (docCategorizedContent) {
                categoryContent += '\n----\n';
            }
        }

        if (docCategorizedContent) {
            categoryContent += '하위 문서' + docCategorizedContent;
        }

        return categoryContent;
    }

    getCategorizedMap(categorizedFullTitleArr) {
        let categorizedMap = new Map();
        categorizedFullTitleArr.forEach((fullTitle) => {
            let chosung = Chosung.getChosung(fullTitle.toUpperCase().charAt(0));
            if (WikiDoc.chosungArr.indexOf(chosung) === -1) {
                chosung = '기타';
            }
            let titleArr = categorizedMap.get(chosung) || [];
            titleArr.push(fullTitle);
            titleArr.sort();
            categorizedMap.set(chosung, titleArr);
        });
        return categorizedMap;
    }

    getCategorizedContent(categorizedMap, isCategory = false) {
        if (categorizedMap.size !== 0) {
            return (
                WikiDoc.chosungArr.reduce((prev, chosung) => {
                    if (categorizedMap.has(chosung)) {
                        prev += `(${chosung}`;
                        if (isCategory) {
                            let categoryTitleArr = categorizedMap.get(chosung);
                            categoryTitleArr = categoryTitleArr.map(
                                (categoryTitle) => {
                                    return `${categoryTitle}|${process.env.CATEGORIZED_TITLE}:${categoryTitle}`;
                                }
                            );
                            prev += `\n:([[${categoryTitleArr.join(
                                ']])\n([['
                            )}]]):)`;
                        } else {
                            prev += `\n:([[${categorizedMap
                                .get(chosung)
                                .join(']])\n([[')}]]):)`;
                        }
                    }
                    return prev;
                }, '\n:') + ':'
            );
        } else {
            return false;
        }
    }

    static chosungArr = [
        '기타',
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'ㄱ',
        'ㄲ',
        'ㄴ',
        'ㄷ',
        'ㄸ',
        'ㄹ',
        'ㅁ',
        'ㅂ',
        'ㅃ',
        'ㅅ',
        'ㅆ',
        'ㅇ',
        'ㅈ',
        'ㅉ',
        'ㅊ',
        'ㅋ',
        'ㅌ',
        'ㅍ',
        'ㅎ',
    ];
}

export default WikiDoc;
