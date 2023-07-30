import wiki from '$lib/server/wiki.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	let { title } = await request.json();
	return json(await wiki.readDoc(title));
}
