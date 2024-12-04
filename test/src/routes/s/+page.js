import { redirect } from '@sveltejs/kit';
import { Utils } from 'ken-wiki';

export async function load() {
    redirect(303, `/r/${Utils.encodeFullTitle('위키:대문')}`);
}