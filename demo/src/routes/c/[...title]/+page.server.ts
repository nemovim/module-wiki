import manageError from '$lib/utils/manageError';
import { error, redirect } from '@sveltejs/kit';
import { compareDocByFullTitle } from 'module-wiki';

export async function load({ params, url, locals }) {
	const fullTitle = params.title;
	const oldRev = Number(url.searchParams.get('old'));
	const newRev = Number(url.searchParams.get('new'));

	try {
		if (oldRev < 0 || newRev <=  0) redirect(300, '/');
		let data = await compareDocByFullTitle(fullTitle, locals.user, oldRev, newRev);
		return {
			fullTitle,
			diff: JSON.stringify(data.diff),
			oldRev,
			newRev,
			// oldDoc: JSON.stringify(data.oldDoc),
			// newDoc: JSON.stringify(data.newDoc),
		};
	} catch (e) {
		manageError(e, fullTitle);
	}
}
