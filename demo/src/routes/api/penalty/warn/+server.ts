import { json } from '@sveltejs/kit';
import { warnUserByName } from 'module-wiki';

export async function POST({ request, locals }) {
	let { userName, duration, comment } = await request.json();
	return json(await warnUserByName(userName, locals.user, duration, comment));
}
