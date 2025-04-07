import { json } from '@sveltejs/kit';
import { getDocLogsByUserName } from 'module-wiki';

export async function POST({ request, locals }) {
	let { userName, pageIdx } = await request.json();
	return json(await getDocLogsByUserName(userName, pageIdx));
}
