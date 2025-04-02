import { json } from '@sveltejs/kit';
import { moveDocByFullTitle } from 'module-wiki';

export async function POST({ request, locals }) {
	let { fullTitle, newFullTitle } = await request.json();
	return json(await moveDocByFullTitle(fullTitle, locals.user, newFullTitle));
}
