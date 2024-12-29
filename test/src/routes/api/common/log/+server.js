import { json } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';

export async function POST({ request }) {
	let { count } = await request.json();
	return json(await WikiManager.getRecentWriteLogs(count));
}
