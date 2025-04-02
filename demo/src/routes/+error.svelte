<script lang="ts">
    import DocHeader from '$lib/modules/docHeader.svelte';
    import { page } from '$app/state';

    // type wikiError = {
    //     errorTitle: string;
    //     errorStack: string;
    // };

</script>

<DocHeader fullTitle={page.error?.fullTitle||''} doc={null} pageType={'error'}></DocHeader>
<article>
    <p>{page.error?.message||''}</p>
</article>
