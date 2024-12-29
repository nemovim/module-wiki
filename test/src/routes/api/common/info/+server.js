import { json } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';

export async function GET() {
	return json(await WikiManager.getInfoArr());
}
