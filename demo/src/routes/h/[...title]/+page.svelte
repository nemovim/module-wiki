<script lang="ts">
    import HistList from './histList.svelte';
    import DocHeader from '$lib/modules/docHeader.svelte';
    import type {Hist} from 'module-wiki';

    let { data } = $props();

    let fullTitle = $derived<string>(data.fullTitle as string);
    let histArr = $derived<Hist[]>(JSON.parse(data.histArr || '[]').toReversed());

</script>

<DocHeader {fullTitle} doc={null} pageType={'hist'} />
<HistList {fullTitle} {histArr} />