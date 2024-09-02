import { redirect, error } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';

export async function load({ params }) {

	const title = params.title;
	let data;

	try {
		data = await WikiManager.searchDoc(title);
	} catch (e) {
		error(401, JSON.stringify({ fullTitle: title, revision: '?', reason: e.message }));
	}

	if (data.status === 'exact') {
		console.log(data.result);
		redirect(303, encodeURI(`/r/${data.result}`));
	} else {
		return {
			fullTitle: title,
			result: JSON.stringify(data.result)
		};
	}
}
