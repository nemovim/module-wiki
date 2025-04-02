import { json } from '@sveltejs/kit';
import { getHistsByFullTitle } from 'module-wiki';

export async function POST({ request, locals }) {
	let { fullTitle, fromRev, toRev } = await request.json();
	return json(await getHistsByFullTitle(fullTitle, locals.user, fromRev, toRev));
}
