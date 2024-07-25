import { error, json } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';

export async function POST({ request, locals }) {
	if (!locals.session) {
		throw error(401, 'Unauthorized');
	}
	let data = await request.json();
	return json(await WikiManager.createHTML(data.markup, data.type, data.categorizedArr));
}
