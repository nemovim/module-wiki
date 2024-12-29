<script>
	import { onMount } from 'svelte';
	import { Utils } from 'ken-wiki';

	const encodeFullTitle = Utils.encodeFullTitle;

	let recentHistArr = [];

	async function getInfoArr(count = 20) {
		await fetch('/api/common/log', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ count })
		})
			.then(async (res) => {
				if (res.status >= 400 && res.status < 600) {
					throw new Error((await res.json()).message);
				} else {
					recentHistArr = await res.json();
					// recentHistArr.reverse();
					let titleSet = new Set();
					recentHistArr = recentHistArr.filter((hist) => {
						if (titleSet.has(hist.fullTitle)) {
							return false;
						} else {
							titleSet.add(hist.fullTitle);
							return true;
						}
					});
				}
			})
			.catch((e) => {
				if (e.message !== 'Unauthorized') {
					console.error(e);
				}
			});
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
	<hr />
{:else}
	{#each recentHistArr as hist, i}
		{#if i <= 10}
			<div>
				<a href="/r/{encodeFullTitle(hist.fullTitle)}">{hist.fullTitle}</a>
				<span>{parseTime(hist.createdAt)}</span>
			</div>
			<hr />
		{/if}
	{/each}
{/if}

<style lang="scss">
	div {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 0.1rem;

		a {
			word-break: break-all;
		}
	}
</style>
