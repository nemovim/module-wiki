import { json } from '@sveltejs/kit';
import { AuthorityManager } from 'ken-wiki';

export async function POST({ request, locals }) {
    let { doc, actionType } = await request.json();
	if (actionType === 'delete') {
		return json(AuthorityManager.canDelete(doc, locals.user.authority));
	} else if (actionType === 'update') {
		return json(AuthorityManager.canUpdate(doc, locals.user.authority));
	} else if (actionType === 'authority') {
		return json(AuthorityManager.canUpdateAuthority(locals.user.authority));
	}
}