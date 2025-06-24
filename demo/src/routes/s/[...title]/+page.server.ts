import { redirect } from '@sveltejs/kit';
import { searchDoc, encodeFullTitle } from 'module-wiki';

export async function load({ params }) {
	const fullTitle = params.title;
	const data = await searchDoc(fullTitle);
	if (data.status === 'exact') {
		redirect(303, `/r/${encodeFullTitle(data.result[0] as string)}`);
	} else {
		return {
			fullTitle,
			result: JSON.stringify(data.result)
		};
	}
}
