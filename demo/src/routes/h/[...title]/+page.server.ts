import manageError from '$lib/utils/manageError';
import { getHistsByFullTitle } from 'module-wiki';

export async function load({ params, locals }) {
	const fullTitle = params.title;

	try {
		const histArr = await getHistsByFullTitle(fullTitle, locals.user, -11, -1) || [];
		return {
			fullTitle,
			histArr: JSON.stringify(histArr),
		};
	} catch (e) {
		manageError(e, fullTitle);
	}
}
