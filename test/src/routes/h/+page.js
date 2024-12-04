import { redirect } from '@sveltejs/kit';
import { Utils } from 'ken-wiki';

const encodeFullTitle = Utils.encodeFullTitle;

export async function load() {
    redirect(303, `/r/${encodeFullTitle('위키:대문')}`);
}