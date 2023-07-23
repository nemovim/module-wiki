import wiki from '$lib/server/wiki.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    let { title, content, author, comment } = await request.json();
    return json(await wiki.writeDoc(title, content, author, comment));
}