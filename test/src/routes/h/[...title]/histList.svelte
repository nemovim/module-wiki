<script>
	import { Utils } from 'ken-wiki';

	const encodeFullTitle = Utils.encodeFullTitle;

	export let histArr;
	export let fullTitle;

	function parseTime(time) {
		const t = new Date(time);
		return `${t.getFullYear()}/${
			t.getMonth() + 1
		}/${t.getDate()} ${t.getHours()}:${t.getMinutes()}`;
	}

	function createByteChangedSpan(prevMarkup, nowMarkup) {
		const delta = calcByte(nowMarkup) - calcByte(prevMarkup);
		if (delta > 0) {
			return `<span style="color: green">+${delta}</span>`;
		} else if (delta < 0) {
			return `<span style="color: red">${delta}</span>`;
		} else {
			return `<span>${delta}</span>`;
		}
	}

	function calcByte(s, b, i, c) {
		for (b = i = 0; (c = s.charCodeAt(i++)); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
		return b;
	}

	async function loadMoreHistories() {
		const rev = histArr[histArr.length - 1].revision;
		const res = await fetch('/api/history', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				fullTitle,
				fromRev: -10,
				toRev: rev - 1
			})
		});

		const newHistArr = await res.json();
		newHistArr.reverse();

		histArr = [...histArr, ...newHistArr];
	}
</script>

{#if histArr === null}
	<p>존재하지 않는 문서입니다.</p>
{:else}
	{#each histArr as hist, i}
		{#if i < histArr.length - 1 || hist.revision === 1}
			<div class="histDiv">
				<span>
					<a href="/h/{encodeFullTitle(fullTitle)}?rev={hist.revision}">{hist.revision}번째 수정판</a>
					{#if hist.revision > 1}
						(<a href="/h/{encodeFullTitle(fullTitle)}?old={hist.revision - 1}&new={hist.revision}">비교</a
						>|{@html createByteChangedSpan(histArr[i + 1].markup, hist.markup)})
					{:else}
						({@html createByteChangedSpan('', hist.markup)})
					{/if}
				</span>
				<span>{hist.author}</span>
				<span>{parseTime(hist.createdAt)}</span>
			</div>
			{#if hist.comment !== ''}
				<div class="commentDiv">
					<p>↳({hist.comment})</p>
				</div>
			{/if}
		{:else}
			<button on:click={loadMoreHistories}>이전 역사</button>
		{/if}
	{/each}
{/if}

<style lang="scss">

	.histDiv {
		display: flex;
		justify-content: space-between;
	}

	.commentDiv {
		justify-content: center !important;
		color: grey;
	}
</style>
