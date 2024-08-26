import { error, json } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';

export async function POST({ request, locals }) {
	if (!locals.session) {
		throw error(401, 'Unauthorized');
	}
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
