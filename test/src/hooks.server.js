import { redirect } from '@sveltejs/kit';
import AuthClient from 'ken-auth/client';
import { WikiDB, WikiManager } from 'ken-wiki';

(new WikiDB()).init().then(async () => {
	console.log('[Wiki DB Is Ready]');
	if (!(await WikiManager.checkInit())) {
		console.log('[Wiki Is Initiating]');
		await WikiManager.firstInit();
	}
	console.log('[Wiki Manager Is Ready]');
});

export async function handle({ event, resolve }) {
	const authClient = new AuthClient('http://localhost:5173', '/api/authenticate', 'wiki');

	const result = await authClient.authenticate(event);

	if (result?.status % 100 === 3) {
		redirect(result.status, result.location);
	}

	let user = await WikiManager.getUserByEmail(result.session.email);

	if (user === null) {
		user = await WikiManager.createNewUserByEmailAndName(result.session.email, result.session.email.split('@')[0]);
	}

	event.locals.session = result.session;
	event.locals.user = user;

	return await resolve(event);
}
