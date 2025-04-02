import { json } from '@sveltejs/kit';
import { type Doc, previewDoc } from 'module-wiki';

export async function POST({ request }) {
	let { doc }: { doc: Doc } = await request.json();
	return json(await previewDoc(doc));
}
