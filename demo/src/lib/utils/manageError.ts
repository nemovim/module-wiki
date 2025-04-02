import { error } from '@sveltejs/kit';

export default function manageError(e: unknown, fullTitle: string): void {
    if (e instanceof Error)
        error(
            401,
            { fullTitle, message: e.message }
        );
    else
        throw new Error('Undefined Error');
    // error(
    //     401,
    //     JSON.stringify({ fullTitle, errorTitle: e.toString(), errorStack: e })
    // );
}