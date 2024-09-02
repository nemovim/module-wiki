import { error, json } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';

export async function POST({ request, locals }) {
	if (!locals.session) {
		error(401, 'Unauthorized');
	}
	let { fullTitle } = await request.json();
	return json(await WikiManager.readDocByFullTitle(fullTitle, locals.user));
}
