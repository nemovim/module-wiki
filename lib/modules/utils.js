import crypto from 'crypto';

export default class Utils {
    static createNewDocId() {
        return crypto.randomBytes(12).toString('base64');
    }

    static getTypeByFullTitle(fullTitle) {
        const [prefix, title] = this.getPrefixAndTitleByFullTitle(fullTitle);
        if (prefix === '일반') {
            return 'general';
        } else if (prefix === '분류') {
            return 'category';
        }
    }

    static getPrefixAndTitleByFullTitle(fullTitle) {
        let prefix = '일반';
        let title = fullTitle;

        if (fullTitle.includes(':')) {
            [prefix, title] = fullTitle.split(':');
        }

        return [prefix, title];
    }

    static setPrefixToTitle(title, prefix) {
        return `${prefix}:${title}`;
    }

    static setPrefixToTitleArr(titleArr, prefix) {
        return titleArr.map((title) => this.setPrefixToTitle(title, prefix));
    }

    static addItemToArrInMap(map, key, value) {
        if (map.has(key)) {
            map.get(key).push(value);
        } else {
            map.set(key, [value]);
        }
    }

    static createPrefixMapByInfoArr(infoArr) {
        const prefixMap = new Map();

        infoArr.forEach((info) => {
            const [prefix, title] = this.getPrefixAndTitleByFullTitle(
                info.fullTitle
            );

            this.addItemToArrInMap(prefixMap, prefix, title);
        });

        return prefixMap;
    }

    static moveItemToFirstInArr(_arr, item) {
        const arr = _arr;

        if (arr.includes(item)) {
            arr.splice(arr.indexOf(item), 1);
            arr.splice(0, 0, item);
        }

        return arr;
    }

    static getDiffArr(prevArr, nextArr) {
        return nextArr.reduce((diffArr, item) => {
            if (prevArr.indexOf(item) === -1) {
                diffArr.push(item);
            }
            return diffArr;
        }, []);
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

// export class WikiComparator {}
