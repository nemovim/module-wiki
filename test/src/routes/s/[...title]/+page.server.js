import { redirect, error } from '@sveltejs/kit';
import { WikiManager } from 'ken-wiki';
import { Utils } from 'ken-wiki';

export async function load({ params }) {
	const fullTitle = params.title.trim();
	// const fullTitle = Utils.decodeFullTitle(params.title);

	let data;

	try {
		data = await WikiManager.searchDoc(fullTitle);
	} catch (e) {
		error(401, JSON.stringify({ fullTitle, errorTitle: e.toString(), errorStack: e.stack}));
	}

	if (data.status === 'exact') {
		redirect(303, `/r/${Utils.encodeFullTitle(data.result)}`);
	} else {
		return {
			fullTitle,
			result: JSON.stringify(data.result)
		};
	}
}
