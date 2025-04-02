import manageError from '$lib/utils/manageError.js';
import { error, redirect } from '@sveltejs/kit';
import { readDocByFullTitle, writeDocByFullTitle, encodeFullTitle, createNewDocByFullTitle } from 'module-wiki';

export async function load({ params, locals }) {
	const fullTitle = params.title;

	try {
		let doc = await readDocByFullTitle(fullTitle, locals.user);

		if (doc === null) {
            doc = createNewDocByFullTitle(fullTitle, locals.user);
			doc.revision = 0;
		}

		return {
			fullTitle,
			doc: JSON.stringify(doc)
		};
	} catch (e) {
		manageError(e, fullTitle);
	}
}

export const actions = {
	default: async ({ request, locals, params }) => {
		try {
			const data = await request.formData();
			const markup = (data.get('markup') || '').toString();
			const comment = (data.get('comment') || '').toString();

			await writeDocByFullTitle(params.title, locals.user, markup, comment);
		} catch (e) {
			manageError(e, params.title);
		}

		redirect(303, `/r/${encodeFullTitle(params.title)}`);
		// goto(`/r/${encodeFullTitle(params.title)}`);
	}
};
