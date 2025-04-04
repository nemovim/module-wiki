import { json } from '@sveltejs/kit';
import { updateStateByFullTitle } from 'module-wiki';

export async function POST({ request, locals }) {
	let { fullTitle, isAllowed, comment } = await request.json();
	return json(await updateStateByFullTitle(fullTitle, locals.user, isAllowed, comment));
}
