<script lang="ts">
    import postReq from '$lib/utils/postReq';
    import { encodeFullTitle } from 'module-wiki';

    let { fullTitle }: { fullTitle: string } = $props();

    let userName = $derived<string>(fullTitle.split(':').slice(1).join(':'));

    async function renameUser(): Promise<void> {
        const name = prompt('새로운 이름을 입력하세요.');
        if (!name) return;

        if (!confirm('변경할 시 30일동안 재변경이 불가합니다.'))
            return;

        const res = await postReq('/api/rename', { userName, name });

        if (res.success) {
            alert('정상적으로 처리되었습니다.');
            window.location.href = '/u/' + encodeFullTitle(name);
        } else {
            alert(res.result.fullTitle + ': ' + res.result.message);
        }
    }
</script>

<button onclick={renameUser}>이름 변경</button>
