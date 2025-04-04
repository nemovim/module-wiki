<script lang="ts">
    import postReq from '$lib/utils/postReq';
    import { encodeFullTitle } from 'module-wiki';
    import type { Doc } from 'module-wiki';

    let { doc }: { doc: Doc | null } = $props();

    async function moveDoc(): Promise<void> {
        if (doc === null || doc.revision === 0) {
            alert('존재하지 않는 문서입니다.');
            return;
        }

        const newFullTitle = prompt('새로운 문서 제목을 입력해 주세요.');
        if (!newFullTitle)
            return;

        const comment = prompt('문서를 이동하는 이유를 입력해 주세요.');

        const res = await postReq('/api/move', {
            fullTitle: doc.fullTitle,
            newFullTitle,
            comment,
        });

        if (res.success) {
            alert('이동이 완료되었습니다.');
            location.href = `/r/${encodeFullTitle(newFullTitle)}`;
        } else {
            alert(res.result.fullTitle + ': ' + res.result.message);
        }
    }
</script>

<button onclick={moveDoc}>이동</button>
