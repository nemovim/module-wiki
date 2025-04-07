import manageError from '$lib/utils/manageError';
import { getDocLogsByUserName, getUserByName, refreshAndGetPenaltiesByName} from 'module-wiki';

export async function load({ params, locals, url }) {
	const userName = params.title;
	const pageIdx = Number(url.searchParams.get('page')) || 1;

	try {
		const penaltyArr = await refreshAndGetPenaltiesByName(userName);
		const logArr = await getDocLogsByUserName(userName, pageIdx) || [];
		const queriedUser = await getUserByName(userName);
		return {
			userName,
			queriedUser: JSON.stringify(queriedUser),
			logArr: JSON.stringify(logArr),
			penaltyArr: JSON.stringify(penaltyArr),
		};
	} catch (e) {
		manageError(e, '사용자:'+userName);
	}
}
