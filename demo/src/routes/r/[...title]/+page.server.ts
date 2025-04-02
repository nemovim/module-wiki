import { readDocByFullTitle } from 'module-wiki';
import manageError from '$lib/utils/manageError';
import modifyHtmlByExistenceOfLinks from '$lib/utils/modifyHtml';

export async function load({ params, locals, url, parent }) {
	const fullTitle = params.title;

	let rev = Number(url.searchParams.get('rev'));
	try {
		if (rev === 0) {
			rev = -1;
		}
		const doc = await readDocByFullTitle(fullTitle, locals.user, rev);
		if (doc)
			doc.html = modifyHtmlByExistenceOfLinks(doc.html || '', JSON.parse((await parent()).fullTitles));
		return {
			fullTitle,
			rev,
			doc: JSON.stringify(doc),
		};
	} catch (e) {
		manageError(e, fullTitle);
	}
}
