<script lang="ts">
    import { page } from '$app/state';
    import DocHeader from '$lib/modules/docHeader.svelte';
    import LogList from '$lib/modules/logList.svelte';
    import postReq from '$lib/utils/postReq.js';
    import { encodeFullTitle, type DocLogDoc } from 'module-wiki';

    let pageIdx = $state<number>(
        Number(page.url.searchParams.get('page')) || 1
    );
    let updatedLogArr = $state<DocLogDoc[]>();

    let { data } = $props();

    let fullTitle = $derived<string>(data.fullTitle as string);
    let logArr = $derived<DocLogDoc[]>(updatedLogArr || JSON.parse(data.logArr || '[]'));

    async function loadMoreLogs(loadType: 'prev' | 'next') {
        if (loadType === 'prev') {
            pageIdx -= 1;
        } else if (loadType === 'next') {
            pageIdx += 1;
        }

        window.history.pushState({}, '', `/h/${encodeFullTitle(fullTitle)}?page=${pageIdx}`);

        const res = await postReq('/api/log/doc', {
            fullTitle,
            pageIdx,
        });

        if (res.success) {
            updatedLogArr = res.result;
        } else {
            alert(res.result.fullTitle + ': ' + res.result.message);
        }
    }
</script>

<DocHeader {fullTitle} doc={null} pageType={'hist'} />
{#if logArr.length === 0}
    <p>역사가 존재하지 않습니다.</p>
{:else}
    <LogList {fullTitle} {logArr} pageType={'hist'} />
        <button disabled={pageIdx === 1} onclick={() => loadMoreLogs('prev')}
            >이전</button
        >
        <button
            disabled={logArr.at(-1)?.revision === 1 && logArr.at(-1)?.action === 'create'}
            onclick={() => loadMoreLogs('next')}>다음</button
        >
{/if}
