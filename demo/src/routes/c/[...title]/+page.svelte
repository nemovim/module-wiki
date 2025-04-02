<script lang="ts">
    import HistCompare from './histCompare.svelte';
    // import type { Doc } from 'module-wiki';
    import type { Change } from 'diff';
    import DocHeader from '$lib/modules/docHeader.svelte';

    let { data } = $props();

    let fullTitle = $derived<string>(data.fullTitle as string);
    let diff = $derived<Change[] | null>(JSON.parse(data.diff || 'null'));
    let oldRev = $derived<number>(data.oldRev as number);
    let newRev = $derived<number>(data.newRev as number);

</script>

<DocHeader {fullTitle} doc={null} pageType={'compare'} description={ `(역사 비교 ${oldRev}&${newRev}번째 수정판)`} />
<HistCompare {diff} />

