import { json } from '@sveltejs/kit';
import { changeUserGroupByName } from 'module-wiki';

export async function POST({ request, locals }) {
	let { userName, group } = await request.json();
	return json(await changeUserGroupByName(userName, group, locals.user));
}
