import { json } from '@sveltejs/kit';
import { updateAuthorityByFullTitle } from 'module-wiki';

export async function POST({ request, locals }) {
	let { fullTitle, action, groupArr } = await request.json();
	return json(await updateAuthorityByFullTitle(fullTitle, locals.user, action, groupArr));
}
