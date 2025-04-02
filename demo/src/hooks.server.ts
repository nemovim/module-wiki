import type { Handle, HandleServerError, ServerInit } from '@sveltejs/kit';
import type { User } from 'module-wiki';

import { redirect, error } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { WIKI_MONGO_URI } from '$env/static/private';

import { handle as authenticationHandle } from './auth.js';
import { activateWiki, encodeFullTitle, getUserByEmail, signinUserByEmail, signupUserByEmailAndName } from 'module-wiki';

export const init: ServerInit = async () => {
	if (WIKI_MONGO_URI === undefined) {
		throw new Error('Please set "WIKI_MONGO_URI" in the .env file!');
	}
	await activateWiki(WIKI_MONGO_URI);
	console.log('[Wiki Is Ready]');
}

const authorizationHandle: Handle = async ({ event, resolve }) => {

	const session = await event.locals.auth();

	if (session?.user?.email) {
		// Authorized
		if (event.url.pathname.startsWith('/signin') || (!event.url.pathname.startsWith('/api') && !event.params.title)) {
			redirect(303, '/r/' + encodeFullTitle('위키:대문'));
		} else {
			event.params.title = (event.params.title||'').trim();

			let user: User | null = await getUserByEmail(session.user.email);
			if (user === null) {
				user = await signupUserByEmailAndName(
					session.user.email,
					session.user.email.split('@')[0]
				);
			}
			event.locals.user = user;

			// console.log(user);
			return await resolve(event);
		}
	} else {
		// Unauthorized
		if (event.url.pathname.startsWith('/api')) {
			error(401, {message: 'Unauthorized', fullTitle: ''});
		} else if (event.url.pathname.startsWith('/signin')) {
			return await resolve(event);
		} else {
			redirect(303, '/signin');
		}
	}
}

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	console.log('Unexpected Error: ' + event.url.pathname)
	return {
		message: error instanceof Error ? error.message : '',
		fullTitle: event.params.title || event.url.pathname,
	};
};

export const handle = sequence(authenticationHandle, authorizationHandle);
