import manageError from '$lib/utils/manageError';
import { getDocLogsByUserName, getUserByName, refreshAndGetPenaltiesByName} from 'module-wiki';

export async function load({ params, locals }) {
	const userName = params.title;

	try {
		const penaltyArr = await refreshAndGetPenaltiesByName(userName);
		const logArr = await getDocLogsByUserName(userName);
		const userGroup = (await getUserByName(userName))?.group || null;
		return {
			userName,
			userGroup,
			logArr: JSON.stringify(logArr),
			penaltyArr: JSON.stringify(penaltyArr),
		};
	} catch (e) {
		manageError(e, '사용자:'+userName);
	}
}
