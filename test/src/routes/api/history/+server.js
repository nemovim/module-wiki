import { json } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';

export async function POST({ request, locals }) {
	let { fullTitle, fromRev, toRev } = await request.json();
	return json(await WikiManager.readHistoriesByFullTitle(fullTitle, locals.user, fromRev, toRev));
}
