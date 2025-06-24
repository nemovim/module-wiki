<script lang="ts">
    import { goto } from '$app/navigation';
    import postReq from '$lib/utils/postReq';
    import { encodeFullTitle, type DocState } from 'module-wiki';

    let { fullTitle, state }: { fullTitle: string; state: DocState } = $props();

    async function showDoc(): Promise<void> {
        if (!confirm('이 문서를 숨김 해제 하시겠습니까?')) return;

        const comment = prompt('이유를 간략하게 입력해 주세요.') || '';

        const res = await postReq('/api/show', { fullTitle, comment });
        if (res.success) {
            alert('정상적으로 처리되었습니다.');
            goto('/a/' + encodeFullTitle(fullTitle));
        } else {
            alert(res.result.fullTitle + ': ' + res.result.message);
        }
    }

    async function hideDoc(): Promise<void> {
        if (!confirm('이 문서를 숨기시겠습니까?')) return;

        const comment = prompt('이유를 간략하게 입력해 주세요.') || '';

        const res = await postReq('/api/hide', { fullTitle, comment });
        if (res.success) {
            alert('정상적으로 처리되었습니다.');
            goto('/a/' + encodeFullTitle(fullTitle));
        } else {
            alert(res.result.fullTitle + ': ' + res.result.message);
        }
    }
</script>

{#if state === 'hidden'}
    <button onclick={showDoc}>숨김 해제</button>
{:else}
    <button onclick={hideDoc}>숨김</button>
{/if}
