import manageError from '$lib/utils/manageError';
import { getDocLogsByFullTitle } from 'module-wiki';

export async function load({ url, params, locals }) {
	const fullTitle = params.title;
	const pageIdx = Number(url.searchParams.get('page')) || 1;

	try {
		const logArr = await getDocLogsByFullTitle(fullTitle, locals.user, pageIdx) || [];
		return {
			fullTitle,
			pageIdx,
			logArr: JSON.stringify(logArr),
		};
	} catch (e) {
		manageError(e, fullTitle);
	}
}
