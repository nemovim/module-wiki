import { createBacklinkHtmlByFullTitle } from 'module-wiki';
import manageError from '$lib/utils/manageError';

export async function load({ params, locals, url  }) {
	const fullTitle = params.title;

	try {
		const html = await createBacklinkHtmlByFullTitle(fullTitle);
		return {
			fullTitle,
			html,
		};
	} catch (e) {
		manageError(e, fullTitle);
	}
}
