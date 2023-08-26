import wiki from '$lib/server/wiki';
import { redirect } from '@sveltejs/kit';

wiki.init().then(() => {
	console.log('[Wiki Is Ready]');
});

export async function handle({ event, resolve }) {
    const TOKEN = event.cookies.get('next-auth.session-token');

    if (TOKEN === undefined) {
		throw redirect(303, 'http://localhost:5173/?re=wiki');
    }

	const RES = await fetch('http://localhost:5173/api/authenticate?re=wiki', {
		// credentials: 'include',
		headers: {
			Authorization: 'Bearer ' + TOKEN,
		}
	});

	const DATA = await RES.json();

	if (!DATA) {
		throw redirect(303, 'http://localhost:5173/?re=wiki');
	} else {
        event.locals.session = DATA;
		return await resolve(event);
	}
}
