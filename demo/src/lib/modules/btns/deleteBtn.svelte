<script lang="ts">
    import { encodeFullTitle } from 'module-wiki';
    import type { Doc } from 'module-wiki';
    import postReq from '$lib/utils/postReq';

    let { doc }: { doc: Doc | null } = $props();

    async function deleteDoc(): Promise<void> {
        if (doc === null || doc.revision === 0) {
            alert('존재하지 않는 문서입니다.');
            return;
        }

        const deleteComment =
            prompt('삭제하는 이유를 간략하게 적어주세요.') || '';

        if (!confirm('정말로 삭제하시겠습니까?')) {
            alert('삭제가 취소되었습니다.');
            return;
        }

        const res = await postReq('/api/delete', {
            fullTitle: doc.fullTitle,
            comment: deleteComment,
        });
        if (res.success) {
            alert('삭제가 완료되었습니다.');
            location.href = `/r/${encodeFullTitle(doc.fullTitle)}`;
        } else {
            alert(res.result.fullTitle + ': ' + res.result.message);
        }
    }
</script>

<button onclick={deleteDoc}>삭제</button>

<style lang="scss">
    button {
        background-color: rgb(255, 220, 220);
    }

    button:hover {
        background-color: rgb(255, 200, 200);
    }
</style>
