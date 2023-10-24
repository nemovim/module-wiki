import wiki from '$lib/server/wiki.js';
import { error, json } from '@sveltejs/kit';

export async function GET({ locals }) {
	if (!locals.session) {
		throw error(401, 'Unauthorized');
	}
	return json(await wiki.getInfoArr());
}
