import { redirect, error } from '@sveltejs/kit';
import { WikiManager, AuthorityManager } from 'ken-wiki';
import xss from 'xss';
import { Utils } from 'ken-wiki';

export async function load({ params, locals }) {
	const fullTitle = params.title.trim();
	// const fullTitle = Utils.decodeFullTitle(params.title);
	try {
		const doc = await WikiManager.readDocByFullTitle(fullTitle, locals.user);
		if (doc !== null && !AuthorityManager.canWrite(doc, locals.user.authority)) {
			throw new Error('Cannot Write');
		} else if (
			doc === null &&
			fullTitle.split(':')[0] === '위키' &&
			!AuthorityManager.canWriteNewWiki(locals.user.authority)
		) {
			throw new Error('Cannot Write');
		}
		return {
			fullTitle,
			doc: JSON.stringify(doc)
		};
	} catch (e) {
		error(401, JSON.stringify({ fullTitle, errorTitle: e.toString(), errorStack: e.stack }));
	}
}

export const actions = {
	default: async ({ request, locals, params }) => {
		try {
			const data = await request.formData();
			const markup = xss(data.get('markup').replaceAll(/\r\n/g, '\n'));

			await WikiManager.writeDocByFullTitle(params.title, locals.user, markup, data.get('comment'));
		} catch (e) {
			error(
				401,
				JSON.stringify({ fullTitle: params.title, errorTitle: e.toString(), errorStack: e.stack })
			);
		}

		redirect(303, `/r/${Utils.encodeFullTitle(params.title)}`);
	}
};
