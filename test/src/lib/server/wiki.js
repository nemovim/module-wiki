import { MONGO_URI } from '$env/static/private';
import WikiEngine from 'ken-wiki';

const WIKI = new WikiEngine(MONGO_URI);

export default WIKI;