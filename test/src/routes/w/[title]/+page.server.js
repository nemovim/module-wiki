export async function load({ params, fetch }) {
	console.log(params);
	let doc = await readDoc(params.title, fetch);
	doc.fullTitle = params.title;
	return doc;
}

async function readDoc(fullTitle, fetch) {
	const res = await fetch('/api/read', {
		method: 'POST',
		body: JSON.stringify({
			fullTitle
		}),
		headers: {
			'content-type': 'application/json'
		}
	});
	return await res.json();
}
