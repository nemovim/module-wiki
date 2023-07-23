import wiki from '$lib/server/wiki';

wiki.init().then(() => {
    console.log('[Wiki Is Ready]');
});