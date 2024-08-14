<script>
	import { onMount } from 'svelte';

	let recentHistArr = [];

	async function getInfoArr(count = 10) {
		const res = await fetch('/api/common/log', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ count })
		});
		recentHistArr = await res.json();
		recentHistArr.reverse();
	}

	function parseTime(time) {
		const t = new Date(time);
		return `${t.getHours()}:${t.getMinutes()}`;
	}

	onMount(() => {
		getInfoArr();
	});
</script>

{#if recentHistArr.length === 0}
	<div>불러오는 중...</div>
	<hr>
{:else}
{#each recentHistArr as hist, i}
	<div>
		<a href="/r/{hist.fullTitle}">{hist.fullTitle}</a> <span>{parseTime(hist.createdAt)}</span>
	</div>
	<hr>
{/each}
{/if}

<style lang="scss">
	div {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 .1rem;
	}
</style>
