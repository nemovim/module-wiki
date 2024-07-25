import { redirect } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';

export async function load({ params }) {
	console.log(params.title);
	let data = await WikiManager.searchDoc(params.title);

	if (data.status === 'exact') {
		throw redirect(303, encodeURI(`/r/${data.result}`));
	} else {
		return {
			title: params.title,
			result: JSON.stringify(data.result)
		};
	}
}
