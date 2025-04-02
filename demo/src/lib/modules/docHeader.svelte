<script lang="ts">
    import type { Doc } from 'module-wiki';
    import DocBtns from './docBtns.svelte';
    import DocTitle from './docTitle.svelte';
    let { fullTitle, doc, pageType, description }: { fullTitle: string; doc: Doc|null; pageType: pageType, description?: string } = $props();
</script>

<article id="headerArticle">
    <DocTitle {fullTitle} {doc} {pageType} {description}></DocTitle>
    <DocBtns {fullTitle} {doc} {pageType}></DocBtns>
</article>

<style lang="scss">
    #headerArticle {
        display: flex;
        align-items: center;
        padding: 1rem;
        justify-content: space-between;
    }
</style>
