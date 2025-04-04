import manageError from '$lib/utils/manageError';
import { getDocLogsByFullTitle } from 'module-wiki';

export async function load({ params, locals }) {
	const fullTitle = params.title;

	try {
		const logArr = await getDocLogsByFullTitle(fullTitle, locals.user, -11, -1) || [];
		return {
			fullTitle,
			logArr: JSON.stringify(logArr),
		};
	} catch (e) {
		manageError(e, fullTitle);
	}
}
