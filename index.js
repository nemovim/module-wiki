import WikiEngine from './lib/modules/wikiEngine.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI === undefined) {
    throw new Error('Please set MONGO_URI at .env file!');
}

const TYPE_STRING = process.env.TYPE_STRING;
if (TYPE_STRING === undefined) {
    throw new Error('Please set TYPE_STRING at .env file!');
} else {
    try {
        const TYPE_OBJ = JSON.parse(TYPE_STRING);
    } catch (e) {
        throw new Error('Something is wrong in TYPE_STRING');
    }
}

const CATEGORIZED_TITLE = process.env.CATEGORIZED_TITLE;
if (CATEGORIZED_TITLE === undefined) {
    throw new Error('Please set CATEGORIZED_TITLE at .env file!');
}
const UNCATEGORIZED_TITLE = process.env.UNCATEGORIZED_TITLE;
if (UNCATEGORIZED_TITLE === undefined) {
    throw new Error('Please set UNCATEGORIZED_TITLE at .env file!');
}

export default WikiEngine;
