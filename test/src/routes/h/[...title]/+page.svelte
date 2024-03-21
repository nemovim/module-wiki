<script>
	import { onMount } from 'svelte';
	import MainSection from '../../mainSection.svelte';

	let diff;

	let title;
	let content;
	let author;
	let comment;
	let history;

	export let data;

	$: {
		diff = JSON.parse(data.diff);

		console.log(diff)

		title = data.fullTitle;
	}

	function write() {
		location.href = `/w/${oldDoc.fullTitle}`;
	}

	function checkHistory() {
		location.href = `/h/${oldDoc.fullTitle}`;
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
