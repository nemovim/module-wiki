import { json } from '@sveltejs/kit';
import { getRecentWriteLogs } from 'module-wiki';

export async function POST({ request }) {
	const { count } = await request.json();
	return json(await getRecentWriteLogs(count));
}
