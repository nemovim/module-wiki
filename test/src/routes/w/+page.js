import { redirect } from '@sveltejs/kit';

export async function load() {
    throw redirect(302, encodeURI('/w/위키:대문'));
}