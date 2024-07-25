import { error, json } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';

export async function POST({ request, locals }) {
	if (!locals.session) {
		throw error(401, 'Unauthorized');
	}
    let { fullTitle, markup, author, comment } = await request.json();
    return json(await WikiManager.writeDocByFullTitle(fullTitle, author, markup, comment));
}