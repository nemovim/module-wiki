import { redirect, error } from '@sveltejs/kit';
import { handle as authenticationHandle } from './auth.js';
import { sequence } from '@sveltejs/kit/hooks';
import { WikiDB, WikiManager } from 'ken-wiki';
import { WIKI_MONGO_URI } from '$env/static/private';

new WikiDB().init(WIKI_MONGO_URI).then(async () => {
	console.log('[Wiki DB Is Ready]');
	if (!(await WikiManager.checkInit())) {
		console.log('[Wiki Is Initiating]');
		await WikiManager.firstInit();
	}
	console.log('[Wiki Manager Is Ready]');
});

async function authorizationHandle({ event, resolve }) {
	const session = await event.locals.auth();

	if (session) {
		// Authorized
		if (event.url.pathname.startsWith('/u/signin')) {
			redirect(303, '/r/');
		} else if (event.url.pathname.startsWith('/api/common')) {
			return resolve(event);
		} else {
			let user = await WikiManager.getUserByEmail(session.user.email);
			if (user === null) {
				user = await WikiManager.createNewUserByEmailAndName(
					session.user.email,
					session.user.email.split('@')[0]
				);
			}
			event.locals.user = user;
			return resolve(event);
		}
	} else {
		// Unauthorized
		if (event.url.pathname.startsWith('/api')) {
			error(401, 'Unauthorized');
		} else if (event.url.pathname.startsWith('/u/signin')) {
			return resolve(event);
		} else {
			redirect(303, '/u/signin');
		}
	}
}

export const handle = sequence(authenticationHandle, authorizationHandle);
