<script>
	import { onMount } from 'svelte';
	import MainSection from '../../mainSection.svelte';
	import HistList from './histList.svelte';
	import HistCompare from './histCompare.svelte';
	import { Utils } from 'ken-wiki';

	const encodeFullTitle = Utils.encodeFullTitle;


	let diff;
	let oldDoc;
	let newDoc;

	let doc;

	let histArr;

	let fullTitle;
	let description;

	export let data;

	fullTitle = data.fullTitle;

	$: {
		if (data.type === 'list') {
			if (histArr === undefined) {
				histArr = JSON.parse(data.histArr);
				if (histArr !== null) {
					histArr.reverse();
				}
				description = '(역사 목록)';
			} else {
				console.log(histArr);
			}
		} else if (data.type === 'compare') {
			diff = JSON.parse(data.diff);
			oldDoc = JSON.parse(data.oldDoc);
			newDoc = JSON.parse(data.newDoc);
			console.log(diff);
			console.log(oldDoc);
			console.log(newDoc);
			description = `(역사 비교 ${oldDoc.revision}&${newDoc.revision}번째 수정판)`;
		} else if (data.type === 'read') {
			doc = JSON.parse(data.doc);
			description = `(역사 열람 ${doc.revision}번째 수정판)`;
		}
	}

	function read() {
		location.href = `/r/${encodeFullTitle(fullTitle)}`;
	}

	function write() {
		location.href = `/w/${encodeFullTitle(fullTitle)}`;
	}

	function checkHistory() {
		location.href = `/h/${encodeFullTitle(fullTitle)}`;
	}
</script>

<MainSection {fullTitle} {description}>
	<span slot="btns">
		<button on:click={read}>열람</button>
		<button on:click={write}>편집</button>
		{#if data.type !== 'list'}
			<button on:click={checkHistory}>역사</button>
		{/if}
	</span>

	<span slot="article">
		{#if data.type === 'read'}
			<article id="mainArticle" class="kmu" contenteditable="false" bind:innerHTML={doc.html} />
		{:else}
			<article id="mainArticle">
				{#if data.type === 'list'}
					<HistList {fullTitle} bind:histArr />
				{:else if data.type === 'compare'}
					<HistCompare bind:diff />
				{/if}
			</article>
		{/if}
	</span>
</MainSection>

<style lang="scss">
	@import '../../../lib/style/kmu.scss';
</style>
