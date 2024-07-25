import { redirect, error } from '@sveltejs/kit';
import { WikiManager, AuthorityManager } from 'ken-wiki';

export async function load({ params, locals }) {
	try {
		let doc = await WikiManager.readDocByFullTitle(params.title, locals.user);
		if (doc !== null && !AuthorityManager.canWrite(doc, locals.user.authority)) {
			throw new Error('Cannot Write');
		} else if (
			doc === null &&
			params.title.split(':')[0] === '위키' &&
			!AuthorityManager.canWriteNewWiki(locals.user.authority)
		) {
			throw new Error('Cannot Write');
		}
		return {
			title: params.title,
			doc: JSON.stringify(doc)
		};
	} catch (e) {
		throw error(
			401,
			JSON.stringify({
				fullTitle: params.title,
				revision: '?',
				reason: e.message
			})
		);
	}
}

export const actions = {
	default: async ({ request, locals, params }) => {
		const data = await request.formData();

		const markup = data.get('markup').replaceAll(/\r\n/g, '\n');

		try {
			await WikiManager.writeDocByFullTitle(params.title, locals.user, markup, data.get('comment'));
		} catch (e) {
			throw error(
				401,
				JSON.stringify({
					fullTitle: params.title,
					revision: '?',
					reason: e.message
				})
			);
		}
		throw redirect(303, encodeURI('/r/' + params.title));
	}
};
