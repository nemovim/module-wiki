<script>
	import MainSection from '../../mainSection.svelte';

	let doc;

	let title;
	let content;
	let author;
	let comment;
	let history;

	export let data;

	$: {
		doc = JSON.parse(data.doc);

		console.log(doc);

		title = doc.fullTitle;
		if (doc.history === -1) {
			// Not exist.
			content = '존재하지 않는 문서입니다.';
			history = 0;
		} else {
			author = doc.author;
			content = doc.html;
			comment = doc.comment;
			history = doc.history;
		}
	}

	function write() {
		location.href = `/w/${doc.fullTitle}`;
	}

	function checkHistory() {
		location.href = `/h/${doc.fullTitle}`;
	}
</script>

<MainSection {title} {history}>
	<span slot="btns">
		<button on:click={write}>편집</button>
		<button on:click={checkHistory}>역사</button>
	</span>

	<span slot="article">
		<article id="mainArticle" class="kmu" contenteditable="false" bind:innerHTML={content} />
	</span>
</MainSection>

<style lang="scss">
	@import '../../../lib/style/kmu.scss';
</style>
