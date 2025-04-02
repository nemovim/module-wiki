<script lang="ts">
    import {
        addPopupListener,
        removePopupListener,
    } from '$lib/utils/footnotePopup';
    import type { Doc } from 'module-wiki';
    import DocHeader from '$lib/modules/docHeader.svelte';
    import postReq from '$lib/utils/postReq.js';
    import { onNavigate } from '$app/navigation';
    import { page } from '$app/state';
    import modifyHtmlByExistenceOfLinks from '$lib/utils/modifyHtml.js';

    let { data, form } = $props();

    let fullTitle = $derived<string>(data.fullTitle as string);
    let doc = $derived<Doc | null>(JSON.parse(data.doc || 'null'));
    let markup = $state<string>();
    let comment = $state<string>('');
    let previewHTML = $state<string>('');

    $effect(() => {
        markup = markup === undefined ? doc?.markup || '' : markup;

        previewHTML;
        addPopupListener();
    });

    async function previewDoc() {
        removePopupListener();

        if (doc !== null) doc.markup = markup || '';

        const res = await postReq('/api/preview', { doc });
        if (res.success)
            previewHTML = modifyHtmlByExistenceOfLinks(
                res.result,
                JSON.parse(page.data.fullTitles)
            );
        else alert(res.result.fullTitle + ': ' + res.result.message);
    }

    onNavigate(() => {
        previewHTML = '';
    });
</script>

{#if !form}
    <DocHeader {fullTitle} {doc} pageType={'write'} />

    <article id="mainArticle">
        <form method="POST">
            <!-- svelte-ignore a11y_autofocus -->
            <textarea
                id="docMarkup"
                contenteditable="true"
                bind:value={markup}
                autofocus
                name="markup"
            ></textarea>
            <input
                id="commentInput"
                placeholder="comment"
                bind:value={comment}
                name="comment"
            />
            <button class="hidden" id="saveBtn">저장</button>
        </form>
        <div id="btnDiv">
            <button id="previewBtn" onclick={previewDoc}>미리보기</button>
            <label for="saveBtn" class="button">저장</label>
        </div>
        <div id="previewDiv" class="kmu">{@html previewHTML}</div>
    </article>
{:else}
    <p>Loading...</p>
{/if}

<style lang="scss">
    @use '../../../lib/style/kmu.scss';

    #docMarkup {
        width: -webkit-fill-available;
        height: 50vh;
        font-size: 1rem;
        padding: 0.8rem 1rem;
        resize: vertical;
    }

    #commentInput {
        width: -webkit-fill-available;
        font-size: 0.8rem;
        padding: 0.2rem 0.5rem;
    }

    #previewDiv {
        margin-top: 1rem;
    }

    #btnDiv {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
    }
</style>
