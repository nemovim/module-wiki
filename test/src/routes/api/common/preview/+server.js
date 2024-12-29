import { json } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';
import xss from 'xss';

export async function POST({ request }) {
	let data = await request.json();
	const markup = xss(data.markup.replaceAll(/\r\n/g, '\n'));
	try {
		return json(await WikiManager.createHTML(markup, data.type, data.categorizedArr));
	} catch (e) {
		return json(e.toString());
	}
}
