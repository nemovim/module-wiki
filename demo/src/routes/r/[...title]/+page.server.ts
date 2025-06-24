import { readDocByFullTitle } from 'module-wiki';
import modifyHtmlByExistenceOfLinks from '$lib/utils/modifyHtml';

export async function load({ params, locals, url, parent }) {
	const fullTitle = params.title;

	let rev = Number(url.searchParams.get('rev'));
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
}
