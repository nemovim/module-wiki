import wiki from '$lib/server/wiki';
import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
	let data = wiki.searchDoc(params.title);

	if (data.status === 'exact') {
		throw redirect(303, encodeURI(`/r/${data.result}`));
	} else {
		return {
			title: params.title,
			result: JSON.stringify(data.result)
		};
	}
}
