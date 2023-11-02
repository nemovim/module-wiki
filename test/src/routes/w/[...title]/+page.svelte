<script>
	import MainSection from '../../mainSection.svelte';

	let doc;

	let title;
	let content;
	let author;
	let comment;
	let history;

	export let data;

	doc = JSON.parse(data.doc);
	console.log(doc);

	title = doc.fullTitle;
	if (doc.history === -1) {
		// Not exist.
		content = '';
		history = 1;
	} else {
		author = doc.author;
		content = doc.content;
		comment = doc.comment;
		history = doc.history + 1;
	}

	function read() {
		location.href = `/r/${encodeURI(title)}`;
	}

	let previewContent = '';
	async function preview() {
		const RES = await fetch('/api/preview', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content
			})
		});

		previewContent = await RES.json();
	}

	async function write() {
		const RES = await fetch('/api/write', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				fullTitle: title,
				content,
				author: 'annonymous',
				comment,
			})
		});

		let result = await RES.json();

		if (result) {
			location.href = `/r/${encodeURI(title)}`;
		} else {
			alert('Something happened!');
		}
	}
</script>

<MainSection {title} {history}>
	<span slot="btns">
		<button on:click={read}>취소</button>
		<button on:click|once={write}>저장</button>
	</span>

	<span slot="article">
		<article id="mainArticle">
				<textarea id="docContent" contenteditable="true" bind:value={content} />
				<input id="commentInput" placeholder="comment" bind:value={comment} />
			<button id="previewBtn" on:click={preview}>미리보기</button>
			<div id="previewDiv" class="kmu" contenteditable="false" bind:innerHTML={previewContent} />
		</article>
	</span>
</MainSection>

<style lang="scss">
	@import '../../../lib/style/kmu.scss';

	#docContent {
		width: -webkit-fill-available;
		height: 50vh;
		font-size: 1rem;
		padding: 0.8rem 1rem;
		resize: vertical;
	}

	#commentInput {
		width: -webkit-fill-available;
		font-size: 0.8rem;
		padding: 0.2rem 0.5rem;
	}

	#previewBtn {
		width: -webkit-fill-available;
		margin-top: 0.5rem;
	}

	#previewDiv {
		margin-top: 1rem;
	}
</style>
