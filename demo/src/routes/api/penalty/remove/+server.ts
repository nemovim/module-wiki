import { json } from '@sveltejs/kit';
import { removePenaltyById } from 'module-wiki';

export async function POST({ request, locals }) {
	let {penaltyId, comment } = await request.json();
	return json(await removePenaltyById(penaltyId, comment, locals.user));
}
