import { json } from '@sveltejs/kit';
import { changeUserNameByName } from 'module-wiki';

export async function POST({ request, locals }) {
	let { userName, name } = await request.json();
	return json(await changeUserNameByName(userName, name, locals.user));
}
