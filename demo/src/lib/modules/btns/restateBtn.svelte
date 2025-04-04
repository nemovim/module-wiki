<script lang="ts">
    import postReq from '$lib/utils/postReq';
    import { encodeFullTitle, type DocState } from 'module-wiki';

    let { fullTitle, state }: { fullTitle: string, state: DocState } = $props();

    async function restateDoc(): Promise<void> {
        let isAllowed = true;
        if (state !== 'forbidden') {
            if (!confirm('이 문서를 숨기시겠습니까?'))
                return;
            isAllowed = false;
        } else {
            if (!confirm('이 문서를 숨김 해제 하시겠습니까?'))
                return;
            isAllowed = true;
        }

        const comment = prompt('이유를 간략하게 입력해 주세요.') || '';

        const res = await postReq('/api/restate', { fullTitle, isAllowed, comment });
        if (res.success) {
            alert('정상적으로 처리되었습니다.');
            window.location.href = '/a/' + encodeFullTitle(fullTitle);
        } else {
            alert(res.result.fullTitle + ': ' + res.result.message);
        }
    }
</script>

{#if state === 'forbidden'}
<button onclick={restateDoc}>숨김 해제</button>
{:else}
<button onclick={restateDoc}>숨김</button>
{/if}
