<script>
	import MainSection from '../../mainSection.svelte';

	let doc;

	let title;
	let content;
	let author;
	let comment;
	let revision;

	export let data;

	$: {
		doc = JSON.parse(data.doc);

		title = data.title;

		if (doc === null) {
			// Not exist.
			content = '존재하지 않는 문서입니다.';
			revision = 0;
		} else if (doc.state === 'deleted') {
			content = '존재하지 않는 문서입니다.';
			revision = doc.revision;
		} else {
			author = doc.author;
			content = doc.html;
			comment = doc.comment;
			revision = doc.revision;
		}
	}

	function write() {
		location.href = `/w/${encodeURI(data.title)}`;
	}

	function checkHistory() {
		location.href = `/h/${encodeURI(data.title)}`;
	}
</script>

<MainSection {title} {revision}>
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
