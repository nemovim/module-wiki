<script>
	import { Utils } from 'ken-wiki';

	const encodeFullTitle = Utils.encodeFullTitle;

	let resultArr = [];
	let searchWord;

	export let data;

	$: {
		searchWord = data.fullTitle;
		resultArr = JSON.parse(data.result);
	}

	function readDoc(title) {
		location.href = `/r/${encodeFullTitle(title)}`;
	}

	function writeDoc(title) {
		location.href = `/w/${encodeFullTitle(title)}`;
	}
</script>

<article>
	<h1>"{searchWord}"에 대한 검색 결과:</h1>
	<button class="resultBtn" on:click={writeDoc(searchWord)}>
		"{searchWord}" 문서를 생성하시겠습니까?
	</button>
	{#each resultArr as result}
		<button class="resultBtn" on:click={readDoc(result.original)}>
			{result.original}
		</button>
	{/each}
</article>

<style lang="scss">
	.resultBtn {
		width: -webkit-fill-available;
		margin: 1rem;
		border: 0.2rem black solid;
		padding: 1rem;
		font-weight: bold;
		font-size: 1rem;
		text-align: left;
	}
</style>
