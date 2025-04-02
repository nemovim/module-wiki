<script lang="ts">
    import DocHeader from '$lib/modules/docHeader.svelte';
    import type { Doc } from 'module-wiki';

    let { data } = $props();

    let doc = $derived<Doc | null>(JSON.parse(data.doc || 'null'));
    let fullTitle = $derived<string>(data.fullTitle as string);
    let rev = $derived<number>(data.rev as number);

    let html = $derived.by<string>(() => {
        if (doc === null) {
            // Not exist.
            if (rev === -1) {
                return '존재하지 않는 문서입니다.';
            } else {
                return '존재하지 않는 수정판입니다.';
            }
        } else if (doc.state === 'deleted' && rev === -1) {
            return '존재하지 않는 문서입니다.';
        } else {
            return doc.html || '';
        }
    });

</script>

<DocHeader {fullTitle} {doc} pageType={'read'} />
{#if rev !== -1}
<p class="caution">이 문서는 <b>{rev}</b>번째 수정판임에 유의하세요.</p>
{/if}
<article id="mainArticle" class="kmu">{@html html}</article>

<style lang="scss">
    @use '../../../lib/style/kmu.scss';
</style>
