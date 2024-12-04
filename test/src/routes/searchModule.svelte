<script>
	import HangulSearcher from 'hangul-search';
	import { Utils } from 'ken-wiki';

	const encodeFullTitle = Utils.encodeFullTitle;

	let searchWord = '';

	let infoArr = [];

	let hangulSearcher;

	let suggestionArr = [];

	async function getInfoArr() {
		let data = await fetch('/api/common/search');
		infoArr = await data.json();
		console.log(infoArr);
		hangulSearcher = new HangulSearcher(infoArr);
		suggest(searchWord);
	}

	function suggest(title) {
		suggestionArr = hangulSearcher.autoComplete(title);
	}

	function checkEnter(e) {
		if (e.key === 'Enter') {
			search(searchWord);
		}
	}

	function search(title) {
		location.href = `/s/${encodeFullTitle(title)}`;
	}

	function readDoc(title) {
		location.href = `/r/${encodeFullTitle(title)}`;
	}

	function onBlurSearchDiv(e) {
		if (e.relatedTarget !== null) {
			if (e.relatedTarget.classList.contains('suggestionBtn')) {
				e.relatedTarget.click();
			} else {
				suggestionArr = [];
			}
		} else {
			suggestionArr = [];
		}
	}
</script>

<div id="searchDiv">
	<input
		type="text"
		on:focus={getInfoArr}
		on:blur={onBlurSearchDiv}
		bind:value={searchWord}
		on:input={suggest(searchWord)}
		on:keydown={checkEnter}
	/>
	<button on:click={search(searchWord)}>Search</button>

	{#each suggestionArr as suggestion, i}
		{#if i <= 8}
			<button on:click={readDoc(suggestion)} class="suggestionBtn" style="top: {(i + 1) * 3}rem">
				{suggestion}</button
			>
		{/if}
	{/each}
</div>

<style lang="scss">
	#searchDiv {
		position: relative;
		display: flex;
		z-index: 999;
		margin-left: 2rem;
	}

	.suggestionBtn {
		position: absolute;
		height: 3rem;
		padding: 0.5rem 1rem;
		font-size: 1.2rem;
		word-break: keep-all;
		white-space: nowrap;
	}
</style>
