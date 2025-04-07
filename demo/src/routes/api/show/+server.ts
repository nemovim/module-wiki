import { json } from '@sveltejs/kit';
import { showDocByFullTitle } from 'module-wiki';

export async function POST({ request, locals }) {
	let { fullTitle, comment } = await request.json();
	return json(await showDocByFullTitle(fullTitle, locals.user, comment));
}
