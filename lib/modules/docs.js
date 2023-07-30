import { WikiTranslator } from './utils';

export class WikiDoc {
    id;
    title;
    history;
    content;
    author;
    comment;
    authority;
    editedTime;

    constructor(param) {
        this.id = param?.id || '';
        this.title = param?.title || '';
        this.content = param?.content || '';
        this.author = param?.author || '???';
        this.comment = param?.comment || '';
        this.history = param?.history || -1;
        this.authority = param?.authority || {
            read: 1,
            write: 1,
            update: 1,
            delete: 1,
        };
        this.editedTime = param?.editedTime || -1;
    }

    getText() {
        return {
            content: this.content,
        };
    }

    getHTML() {
        return {
            content: WikiTranslator.translate(this.content),
        };
    }

    getDocJSON() {
        return {
            id: this.id,
            title: this.title,
            history: this.history,
            authority: this.authority,
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
}

export class WikiCategory extends WikiDoc {
    categorizedArray;

    constructor(param, _categorizedArray) {
        this.categorizedArray = _categorizedArray;
        param.authority = param?.authority || {
            read: 1,
            write: 1,
            update: 999,
            delete: 999,
        };
        super(param);
    }

    getHTML() {
        let mainContent= WikiTranslator.translate(this.content);
        let categoryContent = '';
        return {
            content: mainContent + categoryContent,
        };
    }

    getDocJSON() {
        return {
            id: this.id,
            title: this.title,
            history: this.history,
            authority: this.authority,
            categorized: this.categorized,
        };
    }

}
