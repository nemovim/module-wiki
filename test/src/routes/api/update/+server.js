import { json } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';

export async function POST({ request, locals }) {
	let { fullTitle, newInfo } = await request.json();
	try {
		return json(
			await WikiManager.updateDocByFullTitle(fullTitle, locals.user, newInfo)
		);
	} catch (e) {
		return json({
			error: true,
			msg: e.message
		});
	}
}
