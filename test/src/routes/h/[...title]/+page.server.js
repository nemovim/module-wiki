import { WikiManager } from 'ken-wiki';
import { error } from '@sveltejs/kit';

export async function load({ params, url, locals }) {
	const oldRev = url.searchParams.get('old');
	const newRev = url.searchParams.get('new');
	const rev = url.searchParams.get('rev');

	try {
		if ((oldRev === null || newRev === null) && rev === null) {
			const histArr = await WikiManager.readHistoriesByFullTitle(params.title, locals.user, -10, -1);
			return {
				fullTitle: params.title,
				histArr: JSON.stringify(histArr),
				type: 'list'
			};
		} else if (rev !== null) {
			const doc = await WikiManager.readDocByFullTitle(params.title, locals.user, rev);
			if (doc === null) {
				throw new Error(`${rev}번째 수정판이 존재하지 않습니다.`);
			} else {
				return {
					fullTitle: params.title,
					doc: JSON.stringify(doc),
					type: 'read'
				};
			}
		} else {
			let data = await WikiManager.compareDocByFullTitle(params.title, locals.user, oldRev, newRev);
			return {
				fullTitle: params.title,
				diff: JSON.stringify(data.diff),
				oldDoc: JSON.stringify(data.oldDoc),
				newDoc: JSON.stringify(data.newDoc),
				type: 'compare'
			};
		}
	} catch (e) {
		throw error(401, JSON.stringify({ fullTitle: params.title, revision: '?', reason: e.message }));
	}
}
