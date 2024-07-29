<script>
	import MainSection from '../../mainSection.svelte';

	let doc;

	let fullTitle;
	let markup;
	let comment;
	let revision;
	let type;
	let categorizedArr;
	let previewHTML;

	export let data;

	fullTitle = data.fullTitle;

	doc = JSON.parse(data.doc);

	if (doc === null) {
		// Not exist.
		markup = '';
		revision = 1;
		if (fullTitle.split(':')[0] === '분류') {
			type = 'category';
		} else {
			type = 'general';
		}
		categorizedArr = [];
	} else {
		markup = doc.markup;
		revision = doc.revision + 1;
		type = doc.type;
		if (type === 'category') {
			categorizedArr = doc.categorizedArr;
		} else {
			categorizedArr = [];
		}
	}

	previewHTML = '';

	function read() {
		location.href = `/r/${encodeURI(fullTitle)}`;
	}

	async function preview() {
		const RES = await fetch('/api/preview', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				markup,
				type,
				categorizedArr
			})
		});

		previewHTML = await RES.json();
	}
</script>

<MainSection {fullTitle} description={`${revision}번째 편집`}>
	<span slot="btns">
		<button on:click={read}>취소</button>
		<form method="POST" style="display: inline-block">
			<textarea name="markup" bind:value={markup} class="hidden" />
			<input name="comment" bind:value={comment} class="hidden" />
			<button>저장</button>
		</form>
	</span>

	<span slot="article">
		<article id="mainArticle">
			<textarea id="docMarkup" contenteditable="true" bind:value={markup} />
			<input id="commentInput" placeholder="comment" bind:value={comment} />
			<button id="previewBtn" on:click={preview}>미리보기</button>
			<div id="previewDiv" class="kmu" contenteditable="false" bind:innerHTML={previewHTML} />
		</article>
	</span>
</MainSection>

<style lang="scss">
	@import '../../../lib/style/kmu.scss';

	#docMarkup {
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
