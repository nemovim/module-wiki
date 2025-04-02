import { json } from '@sveltejs/kit';
import { blockUserByName } from 'module-wiki';

export async function POST({ request, locals }) {
	let { userName, duration, comment } = await request.json();
	return json(await blockUserByName(userName, locals.user, duration, comment));
}
