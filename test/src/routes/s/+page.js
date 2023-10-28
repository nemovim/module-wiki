import { redirect } from '@sveltejs/kit';

export async function load() {
    throw redirect(303, encodeURI('/w/위키:대문'));
}