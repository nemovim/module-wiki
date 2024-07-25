<script>
	import HangulSearcher from 'hangul-search';

	let searchWord = '';

	let infoArr = [];

	let hangulSearcher;

	let suggestionArr = [];

	async function getInfoArr() {
		let data = await fetch('/api/common');
		infoArr = await data.json();
		hangulSearcher = new HangulSearcher(infoArr);
		suggest(searchWord);
	}

	function suggest(title) {
		suggestionArr = hangulSearcher.autoComplete(title).splice(0, 5);
	}

	function checkEnter(e) {
		if (e.key === 'Enter') {
			search(searchWord);
		}
	}

	function search(title) {
		location.href = '/s/' + encodeURI(title);
	}

	function readDoc(title) {
		location.href = '/r/' + encodeURI(title);
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
		<button on:click={readDoc(suggestion)} class="suggestionBtn" style="top: {(i + 1) * 3}rem">
			{suggestion}</button
		>
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
	}
</style>
