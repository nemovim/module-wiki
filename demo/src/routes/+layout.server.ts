import { getRecentWriteLogs, getAllFullTitles } from 'module-wiki';
export const load = async ({ locals }) => {
    const logs = await getRecentWriteLogs(20);
    const fullTitles = await getAllFullTitles();
    return {
        logs: JSON.stringify(logs),
        user: JSON.stringify(locals.user),
        fullTitles: JSON.stringify(fullTitles),
    };
}