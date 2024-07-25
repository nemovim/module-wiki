import WikiManager from './lib/modules/wikiManager.js';
import WikiDB from './lib/modules/wikiDB.js';
import AuthorityManager from './lib/modules/authorityManager.js';
import dotenv from 'dotenv';

dotenv.config();

const WIKI_MONGO_URI = process.env.WIKI_MONGO_URI;
if (WIKI_MONGO_URI === undefined) {
    throw new Error('Please set WIKI_MONGO_URI at .env file!');
}

export { WikiManager, WikiDB, AuthorityManager };
