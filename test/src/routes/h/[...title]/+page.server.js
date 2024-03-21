import wiki from '$lib/server/wiki';

export async function load({ params, url }) {
	let oldHist = url.searchParams.get('old')
	let newHist = url.searchParams.get('new')

	if (oldHist === null || newHist === null) {
		let data = await wiki.readDoc(params.title);
		console.log('===doc===')
		console.log(data)
		console.log('=========')
		return {
			fullTitle: params.title,
			history
		}
	} else {
		let data = await wiki.compareDoc(params.title, oldHist, newHist);
	return {
		fullTitle: params.title,
		diff: JSON.stringify(data)
	}
	}
}
