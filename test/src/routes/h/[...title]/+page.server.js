import wiki from '$lib/server/wiki';

export async function load({ params }) {
	let doc = await wiki.readDoc(params.title);
	doc.fullTitle = params.title;
	return {
		doc: JSON.stringify(doc),
	}
}
