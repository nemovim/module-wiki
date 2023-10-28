<script>

	let resultArr = [];
	let searchWord;

	export let data;

	$: {
		searchWord = data.title;
		resultArr = JSON.parse(data.result);
	}

	function readDoc(title) {
		location.href = '/r/' + encodeURI(title);
	}


</script>

<article>
	<h1>"{searchWord}"에 대한 검색 결과:</h1>
	{#each resultArr as result}
		<button class="resultBtn" on:click={readDoc(result.title)}>
			{result.title}
		</button>
	{/each}
</article>

<style lang="scss">
	.resultBtn {
		width: -webkit-fill-available;
		margin: 1rem;
		border: .2rem black solid;
		padding: 1rem;
			font-weight: bold;
			font-size: 1rem;
			text-align: left;

	}
</style>
