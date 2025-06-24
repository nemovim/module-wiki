import { redirect } from '@sveltejs/kit';
import { readDocByFullTitle, writeDocByFullTitle, encodeFullTitle, createNewDocByFullTitle } from 'module-wiki';

export async function load({ params, locals }) {
	const fullTitle = params.title;

	let doc = await readDocByFullTitle(fullTitle, locals.user);

	if (doc === null) {
		doc = createNewDocByFullTitle(fullTitle);
		doc.revision = 0;
	}

	return {
		fullTitle,
		doc: JSON.stringify(doc)
	};
}

export const actions = {
	default: async ({ request, locals, params }) => {
		const data = await request.formData();
		const markup = (data.get('markup') || '').toString();
		const comment = (data.get('comment') || '').toString();

		await writeDocByFullTitle(params.title, locals.user, markup, comment);

		redirect(303, `/r/${encodeFullTitle(params.title)}`);
	}
};
