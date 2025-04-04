<script lang="ts">
    import DocHeader from '$lib/modules/docHeader.svelte';
    import LogList from '$lib/modules/logList.svelte';
    import postReq from '$lib/utils/postReq.js';
    import type {DocLogDoc, Hist} from 'module-wiki';

    let { data } = $props();

    let fullTitle = $derived<string>(data.fullTitle as string);
    let logArr = $derived<DocLogDoc[]>(JSON.parse(data.logArr || '[]'));

    // async function loadMoreHistories(): Promise<void> {
    //     if (logArr == null) return;
    //     const rev = logArr[logArr.length - 1].revision;
    //     const res = await postReq('/api/history', {
    //         fullTitle,
    //         fromRev: -11,
    //         toRev: rev - 1,
    //     });

    //     if (res.success) {
    //         const newHistArr = res.result;
    //         newHistArr.reverse();
    //         logArr = [...logArr, ...newHistArr];
    //     } else {
    //         alert(res.result.fullTitle + ': ' + res.result.message);
    //     }
    // }

</script>

<DocHeader {fullTitle} doc={null} pageType={'hist'} />
{#if logArr.length === 0}
    <p>존재하지 않는 문서입니다.</p>
{:else}
    <LogList {fullTitle} {logArr} pageType={'hist'} />
    <!-- {#if logArr[logArr.length - 1].revision !== 1}
        <button onclick={loadMoreHistories}>이전 역사</button>
    {/if} -->
{/if}