import { fail, redirect } from '@sveltejs/kit';
import { encodeFullTitle, uploadFileByFullTitle, createNewDocByFullTitle } from 'module-wiki';

export async function load({ params, locals }) {
	const doc = createNewDocByFullTitle('파일:임시');
	return {
		boilerplate: doc.markup,
	}
}

export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const markup = (data.get('markup') || '').toString();
		const fullTitle = '파일:' + (data.get('title') || '').toString();
		const file = (data.get('file') as File);
		const comment = (data.get('comment') || '').toString();

		if (file.size === 0) return fail(400, { message: 'The file must not be empty!' });
		if ((data.get('title') || '').toString() === '') return fail(400, { message: 'The title must not be empty!' });

		await uploadFileByFullTitle(fullTitle, file, markup, locals.user, comment);

		redirect(303, `/r/${encodeFullTitle(fullTitle)}`);
	}
};
