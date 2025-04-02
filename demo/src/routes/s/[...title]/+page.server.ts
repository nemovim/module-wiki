import manageError from '$lib/utils/manageError';
import { redirect, error, isRedirect } from '@sveltejs/kit';
import { searchDoc, encodeFullTitle } from 'module-wiki';

export async function load({ params }) {
	const fullTitle = params.title;

	try {
		const data = await searchDoc(fullTitle);
		if (data.status === 'exact') {
			redirect(303, `/r/${encodeFullTitle(data.result[0] as string)}`);
		} else {
			return {
				fullTitle,
				result: JSON.stringify(data.result)
			};
		}
	} catch (e) {
		if (!isRedirect(e))
			manageError(e, fullTitle);
		else
			redirect(e.status, e.location);
	}

}
