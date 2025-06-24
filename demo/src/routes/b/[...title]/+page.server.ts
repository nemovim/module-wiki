import { createBacklinkHtmlByFullTitle } from 'module-wiki';

export async function load({ params }) {
	const fullTitle = params.title;
	const html = await createBacklinkHtmlByFullTitle(fullTitle);
	return {
		fullTitle,
		html,
	};
}
