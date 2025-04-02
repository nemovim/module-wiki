<script lang="ts">
    import DocHeader from '$lib/modules/docHeader.svelte';

    let { data } = $props();

    let fullTitle = $derived<string>(data.fullTitle as string);
    let html = $derived.by<string | null>(() => {
        if (!data.html)
            return null;
        return data.html.replace('<div id="content"><div><br>', '<div id="content"><div>');
    });
</script>

<DocHeader {fullTitle} doc={null} pageType={'backlink'} />

<article id="mainArticle" class="kmu">
    {#if !html}
        <p>역링크가 존재하지 않습니다.</p>
    {:else}
        {@html html}
    {/if}
</article>

<style lang="scss">
    @use '../../../lib/style/kmu.scss';
</style>
