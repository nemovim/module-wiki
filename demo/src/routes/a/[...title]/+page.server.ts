import manageError from '$lib/utils/manageError';
import { readDocByFullTitle } from 'module-wiki';

export async function load({ params, locals }) {
	const fullTitle = params.title;

	try {
		const doc = await readDocByFullTitle(fullTitle, locals.user);
		return {
			fullTitle,
			doc: JSON.stringify(doc)
		};
	} catch (e) {
		manageError(e, fullTitle);
	}

}
