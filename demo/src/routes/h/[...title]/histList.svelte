<script lang="ts">
    import { calcByte, parseTime } from '$lib/utils/general';
    import postReq from '$lib/utils/postReq';
    import { type Hist, encodeFullTitle } from 'module-wiki';

    let { fullTitle, histArr }: { fullTitle: string; histArr: Hist[] } =
        $props();

    function createByteChangedSpan(
        prevMarkup: string,
        nowMarkup: string
    ): string {
        const delta = calcByte(nowMarkup) - calcByte(prevMarkup);
        if (delta > 0) {
            return `<span style="color: green">+${delta}</span>`;
        } else if (delta < 0) {
            return `<span style="color: red">${delta}</span>`;
        } else {
            return `<span>${delta}</span>`;
        }
    }


    async function loadMoreHistories(): Promise<void> {
        if (histArr == null) return;
        const rev = histArr[histArr.length - 1].revision;
        const res = await postReq('/api/history', {
            fullTitle,
            fromRev: -11,
            toRev: rev - 1,
        });

        if (res.success) {
            const newHistArr = res.result;
            newHistArr.reverse();
            histArr = [...histArr, ...newHistArr];
        } else {
            alert(res.result.fullTitle + ': ' + res.result.message)
        }


    }
</script>

{#if histArr.length === 0}
    <p>존재하지 않는 문서입니다.</p>
{:else}
    {#each histArr as hist, i}
		{#if i !== histArr.length-1 || hist.revision === 1}
			<!-- {#if i < histArr.length - 1 || hist.revision === 1} -->
			<div class="histDiv">
				<span>
					<a href="/r/{encodeFullTitle(fullTitle)}?rev={hist.revision}"
						>{hist.revision}번째 수정판</a
					>
					{#if hist.revision === 1}
						(<a
							href="/c/{encodeFullTitle(
								fullTitle
							)}?old={hist.revision - 1}&new={hist.revision}">비교</a
						>|{@html createByteChangedSpan('', hist.markup)})
					{:else}
						(<a
							href="/c/{encodeFullTitle(
								fullTitle
							)}?old={hist.revision - 1}&new={hist.revision}">비교</a
						>|{@html createByteChangedSpan(
							histArr[i + 1].markup,
							hist.markup
						)})
					{/if}
				</span>
				<span>{hist.userName}</span>
				<span>{parseTime(hist.time)}</span>
			</div>
			{#if hist.comment !== ''}
				<div class="commentDiv">
					<p>↳({@html hist.comment})</p>
				</div>
			{/if}
		{/if}
        <!-- {:else} -->
        <!-- {/if} -->
    {/each}
    {#if histArr[histArr.length - 1].revision !== 1}
        <button onclick={loadMoreHistories}>이전 역사</button>
    {/if}
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
