import { redirect, error } from '@sveltejs/kit';
import { WikiManager, AuthorityManager } from 'ken-wiki';
import xss from 'xss';

export async function load({ params, locals }) {
	try {
		const doc = await WikiManager.readDocByFullTitle(params.title, locals.user);
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
			fullTitle: params.title,
			doc: JSON.stringify(doc)
		};
	} catch (e) {
		error(
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
		try {
			const data = await request.formData();
			const markup = xss(data.get('markup').replaceAll(/\r\n/g, '\n'));

			await WikiManager.writeDocByFullTitle(params.title, locals.user, markup, data.get('comment'));
		} catch (e) {
			console.log(e);
			error(
            				401,
            				JSON.stringify({
            					fullTitle: params.title,
            					revision: '?',
            					reason: e.message
            				})
            			);
		}

		redirect(303, encodeURI('/r/' + params.title));
	}
};
