import { error, json } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';

export async function POST({ request, locals }) {
	if (!locals.session) {
		throw error(402, 'Unauthorized');
	}
	let { fullTitle, fromRev, toRev } = await request.json();
	return json(await WikiManager.readHistoriesByFullTitle(fullTitle, locals.user, fromRev, toRev));
}
