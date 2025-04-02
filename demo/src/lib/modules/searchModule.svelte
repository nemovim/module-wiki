<script lang="ts">
    import { page } from '$app/state';
    import HangulSearcher from 'hangul-searcher';
    import { encodeFullTitle } from 'module-wiki';

    let searchWord = $state<string>('');

    let fullTitleArr = $derived<string[]>(JSON.parse(page.data.fullTitles));

    let hangulSearcher = $derived(new HangulSearcher(fullTitleArr));

    let suggestionArr = $state<any[]>([]);

    // async function getInfoArr() {
    // 	const data = await fetch('/api/search');
    // 	fullTitleArr = await data.json();
    // 	suggest(searchWord);
    // }

    function suggest(title: string): void {
        suggestionArr = hangulSearcher.autoComplete(title);
    }

    function checkEnter(e: KeyboardEvent): void {
        if (e.key === 'Enter') {
            search(searchWord);
        }
    }

    function search(title: string): void {
        location.href = `/s/${encodeFullTitle(title)}`;
    }

    function readDoc(title: string): void {
        location.href = `/r/${encodeFullTitle(title)}`;
    }

    function onBlurSearchDiv(e: FocusEvent): void {
        if (e.target !== null && e.relatedTarget instanceof HTMLElement) {
            if (e.relatedTarget.classList.contains('suggestionBtn')) {
                e.relatedTarget.click();
            } else {
                suggestionArr = [];
            }
        } else {
            suggestionArr = [];
        }
    }
</script>

<div id="search-div">
    {#if page.data.user}
        <input
        id="keyword-input"
            type="text"
            onfocus={() => suggest('')}
            onblur={onBlurSearchDiv}
            oninput={() => suggest(searchWord)}
            onkeydown={checkEnter}
            bind:value={searchWord}
            autocomplete='off'
        />
        <button onclick={() => search(searchWord)}>검색</button>

        {#each suggestionArr as suggestion, i}
            {#if i <= 8}
                <button
                    onclick={() => readDoc(suggestion)}
                    class="suggestion-btn"
                    style="top: {(i + 1) * 3}rem"
                >
                    {suggestion}</button
                >
            {/if}
        {/each}
    {/if}
</div>

<style lang="scss">
    #search-div {
        position: relative;
        display: flex;
        z-index: 999;
        margin-left: 2rem;
    }

    #keyword-input {
        font-size: 1.2rem;
        padding: .2rem .6rem;
        width: 20rem;
    }

    .suggestion-btn {
        position: absolute;
        height: 3rem;
        padding: 0.5rem 1rem;
        font-size: 1.2rem;
        word-break: keep-all;
        white-space: nowrap;
    }
</style>
