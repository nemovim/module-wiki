import { json } from '@sveltejs/kit';
import { deleteDocByFullTitle } from 'module-wiki';

export async function POST({ request, locals }) {
	let { fullTitle, comment } = await request.json();
	return json(await deleteDocByFullTitle(fullTitle, locals.user, comment));
}
