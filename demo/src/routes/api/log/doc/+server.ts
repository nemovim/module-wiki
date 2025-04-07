import { json } from '@sveltejs/kit';
import { getDocLogsByFullTitle } from 'module-wiki';

export async function POST({ request, locals }) {
	let { fullTitle, pageIdx } = await request.json();
	return json(await getDocLogsByFullTitle(fullTitle, locals.user, pageIdx));
}
