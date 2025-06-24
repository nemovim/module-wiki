import { readDocByFullTitle } from 'module-wiki';

export async function load({ params, locals }) {
	const fullTitle = params.title;
	const doc = await readDocByFullTitle(fullTitle, locals.user);
	return {
		fullTitle,
		doc: JSON.stringify(doc)
	};
}
