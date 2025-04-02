<script lang="ts">
    import DocHeader from '$lib/modules/docHeader.svelte';
    import { encodeFullTitle, type Doc, type DocAction } from 'module-wiki';
    import { page } from '$app/state';

    let { data } = $props();

    let doc = $derived<Doc | null>(JSON.parse(data.doc || 'null'));
    let fullTitle = $derived<string>(data.fullTitle as string);

    const docActionArr: DocAction[] = [
        'read',
        'write',
        'move',
        'delete',
        'authority',
        'state',
    ];

    const translatedDocActionArr: string[] = [
        '열람',
        '편집',
        '이동',
        '삭제',
        '문서 권한 변경',
        '문서 상태 변경',
    ]
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
                    onclick={() => console.log('hi')}>변경</button
                >
            {/if}
        </div>
        <hr>
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
        margin: .5rem;
    }

    .change-authority-btn {
        padding: 0.1rem 0.5rem;
        font-size: 0.7rem;
    }
</style>
