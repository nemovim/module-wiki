<script lang="ts">
    import { encodeFullTitle, type SearchResult } from 'module-wiki';

    let { data } = $props();

    let resultArr = $derived<Array<SearchResult>>(JSON.parse(data.result || '[]'));
    let searchWord = $derived<string>(data.fullTitle as string);

    function readDoc(_fullTitle: string): void {
        location.href = `/r/${encodeFullTitle(_fullTitle)}`;
    }

    function writeDoc(_fullTitle: string): void {
        location.href = `/w/${encodeFullTitle(_fullTitle)}`;
    }
</script>

<article>
    <h1>"{searchWord}"에 대한 검색 결과:</h1>
    <button class="resultBtn" onclick={() => writeDoc(searchWord)}>
        "{searchWord}" 문서를 생성하시겠습니까?
    </button>
    {#each resultArr as result}
        <button class="resultBtn" onclick={() => readDoc(result.original)}>
            {result.original}
        </button>
    {/each}
</article>

<style lang="scss">
    .resultBtn {
        width: -webkit-fill-available;
        margin: 1rem;
        border: 0.2rem black solid;
        padding: 1rem;
        font-weight: bold;
        font-size: 1rem;
        text-align: left;
    }
</style>
