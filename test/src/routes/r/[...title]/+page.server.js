import { WikiManager } from 'ken-wiki';

export async function load({ params, locals }) {
	const doc = await WikiManager.readDocByFullTitle(params.title, locals.user);
	return {
		title: params.title,
		doc: JSON.stringify(doc)
	};
}
