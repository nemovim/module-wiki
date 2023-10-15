import wiki from '$lib/server/wiki';
import { redirect } from '@sveltejs/kit';
import AuthClient from 'ken-auth/client';

wiki.init().then(() => {
	console.log('[Wiki Is Ready]');
});

export async function handle({ event, resolve }) {
	let authClient = new AuthClient('http://localhost:5173', '/api/authenticate', 'wiki');

	let result = await authClient.authenticate(event);

	if (result?.status % 100 === 3) {
		throw redirect(result.status, result.location);
	}

	event.locals.session = result.session;

	return await resolve(event);
}
