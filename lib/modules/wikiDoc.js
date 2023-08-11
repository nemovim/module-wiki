import { WikiTranslator } from './utils';

class WikiDoc {
    id;
    title;
    type;
    state;
    history;
    content;
    author;
    comment;
    authorityObj;
    editedTime;

    constructor(param) {
        this.id = param?.id || '';
        this.title = param?.title || '';
        this.type = param?.type || '';
        this.state = param?.state || '';
        this.content = param?.content || '';
        this.author = param?.author || '???';
        this.comment = param?.comment || '';
        this.history = param?.history || -1;
        this.authorityObj = param?.authorityObj || (this.type === 'category' ? {
            read: 1,
            write: 1,
            update: 100,
            delete: 100,
        } : {
            read: 1,
            write: 1,
            update: 1,
            delete: 1,
        });
        this.editedTime = param?.editedTime || -1;
    }

    getText() {
        return this.content;
    }

    getHTML() {
        let mainContent = WikiTranslator.translate(this.content);
        let categoryContent = '';

        if (this.type === 'category') {
        }

        return mainContent + categoryContent;
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
}

export default WikiDoc;