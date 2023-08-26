import wiki from '$lib/server/wiki.js';
import { redirect, error } from '@sveltejs/kit';

export async function load({ params }) {
	let doc = await wiki.readDoc(params.title);
	doc.fullTitle = params.title;
	return {
		doc: JSON.stringify(doc),
	}
}

export const actions = {
	default: async ({ request, locals, params }) => {

		if (!locals.session) {
			throw error(401, 'Unauthorized');
		}

		const DATA = await request.formData();

		const CONTENT = DATA.get('content').replaceAll(/\r\n/g, '\n');
		await wiki.writeDoc(params.title, CONTENT, '', DATA.get('comment'));

		throw redirect(303, encodeURI('/r/' + params.title));
	}
}