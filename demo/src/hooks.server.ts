import type { Handle, HandleServerError, ServerInit } from '@sveltejs/kit';
import type { User } from 'module-wiki';

import { redirect, error, isRedirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { WIKI_MONGO_URI, AWS_BUCKET_NAME, AWS_ID, AWS_SECRET } from '$env/static/private';

import { handle as authenticationHandle } from './auth.js';
import { activateWiki, backupWiki, encodeFullTitle, getUserByEmail, signinUserByEmail, signupUserByEmailAndName } from 'module-wiki';

export const init: ServerInit = async () => {
	if (WIKI_MONGO_URI === undefined) {
		throw new Error('Please set "WIKI_MONGO_URI" in the .env file!');
	}
	if (AWS_BUCKET_NAME === undefined) {
		throw new Error('Please set "AWS_BUCKET_NAME" in the .env file!');
	}
	if (AWS_ID === undefined) {
		throw new Error('Please set "AWS_ID" in the .env file!');
	}
	if (AWS_SECRET === undefined) {
		throw new Error('Please set "AWS_SECRET" in the .env file!');
	}

	await activateWiki(WIKI_MONGO_URI, AWS_BUCKET_NAME, AWS_ID, AWS_SECRET);

	await backupWiki();
	setInterval(() => {
		backupWiki();
	}, 1000 * 60 * 60 * 24 * 7); // 7일

	console.log('[Wiki Is Ready]');
}

const authorizationHandle: Handle = async ({ event, resolve }) => {

	const session = await event.locals.auth();

	// console.log(`url: ${event.url.pathname} | session: ${!!session?.user}`)

	if (session?.user?.email) {
		// Authorized
		if (event.url.pathname.startsWith('/signin'))
			redirect(302, '/r/' + encodeFullTitle('위키:대문'));
		if (!event.params.title) {
			if (!event.url.pathname.startsWith('/api') && !event.url.pathname.startsWith('/f'))
				redirect(302, '/r/' + encodeFullTitle('위키:대문'));
		}

		event.params.title = (event.params.title || '').trim();

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
	} else {
		// Unauthorized
		if (event.url.pathname.startsWith('/api')) {
			error(401, { message: 'Unauthorized', fullTitle: event.params.title || event.url.pathname });
		} else if (event.url.pathname.startsWith('/signin')) {
			return await resolve(event);
		} else {
			redirect(303, '/signin');
		}
	}
}

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	let fullTitle = event.params.title || event.url.pathname;
	if (event.url.pathname.startsWith('/u')) fullTitle = '사용자:' + event.params.title;

	return {
		message: error instanceof Error ? error.message : '알 수 없는 에러',
		fullTitle,
	};
};

export const handle = sequence(authenticationHandle, authorizationHandle);
