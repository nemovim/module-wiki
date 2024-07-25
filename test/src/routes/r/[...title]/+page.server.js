import { WikiManager } from 'ken-wiki';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
	try {
		const doc = await WikiManager.readDocByFullTitle(params.title, locals.user);
		// console.log('===doc===')
		// console.log(doc);
		// console.log('===user===')
		// console.log(locals.user.authority);
		return {
			title: params.title,
			doc: JSON.stringify(doc)
		};
	} catch (e) {
		throw error(401, JSON.stringify({ fullTitle: params.title, revision: '?', reason: e.message}));
	}
}
