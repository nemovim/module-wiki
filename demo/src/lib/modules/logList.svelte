<script lang="ts">
    import {
        docActionArr,
        parseTime,
        translatedDocActionArr,
    } from '$lib/utils/general';
    import { type DocLogDoc, encodeFullTitle } from 'module-wiki';

    let {
        fullTitle,
        logArr,
        pageType,
    }: { fullTitle: string; logArr: DocLogDoc[]; pageType: pageType } =
        $props();

    function createDeltaSpan(delta: number): string {
        if (delta > 0) {
            return `<span style="color: green">+${delta}</span>`;
        } else if (delta < 0) {
            return `<span style="color: red">${delta}</span>`;
        } else {
            return `<span>${delta}</span>`;
        }
    }

</script>

{#each logArr as log, i}
    <div class="log-div">
        <span>
            <span class="doc-action-span">
                [{translatedDocActionArr[docActionArr.indexOf(log.action)]}]
            </span>
            <a href="/r/{encodeFullTitle(log.fullTitle)}?rev={log.revision}">
                {#if pageType === 'user'}
                    {log.fullTitle}(r{log.revision})
                {:else if pageType === 'hist'}
                    {log.revision}번째 수정판
                {/if}
            </a>
            {#if ['create', 'edit', 'delete'].includes(log.action)}
                (<a
                    href="/c/{encodeFullTitle(
                        log.fullTitle
                    )}?old={log.revision - 1}&new={log.revision}">비교</a
                >|{@html createDeltaSpan(log.delta)})
            {/if}
        </span>
        {#if pageType === 'hist'}
            <a href="/u/{encodeFullTitle(log.userName)}">{log.userName}</a>
        {/if}
        <span>
            {parseTime(log.time)}</span>
    </div>
    <div class="comment-div">
        {#if log.comment !== '' && log.systemLog !== ''}
            <p>↳(<b>{log.systemLog}</b> | {log.comment})</p>
        {:else if log.comment !== '' && log.systemLog === ''}
            <p>↳({log.comment})</p>
        {:else if log.comment === '' && log.systemLog !== ''}
            <p>↳(<b>{log.systemLog}</b>)</p>
        {/if}
    </div>
{/each}

<style lang="scss">
    .log-div {
        display: flex;
        justify-content: space-between;
    }

    .comment-div {
        justify-content: center !important;
        color: grey;
    }

    .doc-action-span {
        font-weight: bold;
    }
</style>
