import { WikiManager } from 'ken-wiki';
import { error } from '@sveltejs/kit';

export async function load({ params, locals}) {
	try {
		const doc = await WikiManager.readDocByFullTitle(params.title, locals.user, -1);
		return {
			fullTitle: params.title,
			doc: JSON.stringify(doc),
		};
	} catch (e) {
		error(401, JSON.stringify({ fullTitle: params.title, revision: '?', reason: e.message}));
	}
}
