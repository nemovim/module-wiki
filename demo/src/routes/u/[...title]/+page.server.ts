import manageError from '$lib/utils/manageError';
import { getUserByName, refreshAndGetPenaltiesByName} from 'module-wiki';

export async function load({ params, locals }) {
	const userName = params.title;

	try {
		const penaltyArr = await refreshAndGetPenaltiesByName(userName);
		const userGroup = (await getUserByName(userName))?.group || null;
		return {
			userName,
			userGroup,
			penaltyArr: JSON.stringify(penaltyArr),
		};
	} catch (e) {
		manageError(e, '사용자:'+userName);
	}
}
