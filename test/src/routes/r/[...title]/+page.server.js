import { WikiManager } from 'ken-wiki';
import { error } from '@sveltejs/kit';
// import { Utils } from 'ken-wiki';

export async function load({ params, locals }) {
	const fullTitle = params.title.trim();
	// const fullTitle = Utils.decodeFullTitle(params.title);
	try {
		const doc = await WikiManager.readDocByFullTitle(fullTitle, locals.user);
		return {
			fullTitle,
			doc: JSON.stringify(doc),
		};
	} catch (e) {
		error(401, JSON.stringify({ fullTitle, errorTitle: e.toString(), errorStack: e.stack}));
	}
}
