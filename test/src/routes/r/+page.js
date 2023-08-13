import { redirect } from '@sveltejs/kit';

export async function load() {
    throw redirect(302, encodeURI('/r/위키:대문'));
}