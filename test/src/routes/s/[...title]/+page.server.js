import wiki from '$lib/server/wiki';

export async function load({ params }) {
	let result = wiki.searchDoc(params.title);

	return {
		title: params.title,
		result: JSON.stringify(result),
	}
}
