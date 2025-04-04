<script lang="ts">
    import DocHeader from '$lib/modules/docHeader.svelte';
    import { type Doc, type DocAction, type Group } from 'module-wiki';
    import { page } from '$app/state';
    import {
        docActionArr,
        groupArr,
        translatedDocActionArr,
    } from '$lib/utils/general.js';
    import postReq from '$lib/utils/postReq.js';

    let { data } = $props();

    let doc = $derived<Doc | null>(JSON.parse(data.doc || 'null'));
    let fullTitle = $derived<string>(data.fullTitle as string);

    async function changeAuthority(docAction: DocAction): Promise<void> {
        if (!doc) throw new Error('아직 존재하지 않는 문서입니다.');

        const groupPrompt = prompt(
            docAction + '을(를) 허용할 권한들을 쉼표로 구분하여 입력하세요.'
        );

        if (!groupPrompt) return;

        const newGroupArr = groupPrompt.trim().split(/ *, */) as Group[];

        // for (let group of newGroupArr) {
        //     if (!groupArr.includes(group)) {
        //         alert(`${group}은(는) 정의될 수 없는 형식입니다.`);
        //         return;
        //     }
        // }

        const res = await postReq('/api/authority', { fullTitle, action: docAction, groupArr: newGroupArr });

        if (res.success) alert('정상적으로 처리되었습니다.');
        else alert(res.result.fullTitle + ': ' + res.result.message);
    }
</script>

<DocHeader {fullTitle} {doc} pageType={'authority'} />
{#if !doc}
    <p>존재하지 않는 문서입니다.</p>
{:else}
    {#each docActionArr as docAction, i}
        <div class="action-div">
            <div>
                <span class="action-span">[{translatedDocActionArr[i]}]</span>
                <span>
                    {#if doc.authority[docAction]}
                        {doc.authority[docAction]}
                    {:else}
                        None
                    {/if}
                </span>
            </div>
            {#if ['manager', 'dev'].includes(JSON.parse(page.data.user).group)}
                <button
                    class="change-authority-btn"
                    onclick={() => changeAuthority(docAction)}>변경</button
                >
            {/if}
        </div>
        <hr />
    {/each}
{/if}

<style lang="scss">
    .action-span {
        font-weight: bold;
    }

    .action-div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0.5rem;
    }

    .change-authority-btn {
        padding: 0.1rem 0.5rem;
        font-size: 0.7rem;
    }
</style>
