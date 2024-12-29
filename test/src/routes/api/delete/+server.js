import { json } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';

export async function POST({ request, locals }) {
	let { fullTitle, comment } = await request.json();
	try {
		return json(await WikiManager.deleteDocByFullTitle(fullTitle, locals.user, comment));
	} catch (e) {
		return json({
			error: true,
			msg: e.message
		});
	}
}
