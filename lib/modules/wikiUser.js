export default class WikiUser {

    #id;

    // 0: Not a user | 1: Common user | 5: Student council | 10: Master
    #authority;

    constructor(_id, _authority) {
        this.#id = _id;
        this.#authority = _authority || 0;
    }

}