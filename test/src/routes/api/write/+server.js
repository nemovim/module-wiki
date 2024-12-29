import { json } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';
import xss from 'xss';

export async function POST({ request, locals }) {
    let { fullTitle, markup, comment } = await request.json();
	markup = xss(markup.replaceAll(/\r\n/g, '\n'));
    return json(await WikiManager.writeDocByFullTitle(fullTitle, locals.user, markup, comment));
}