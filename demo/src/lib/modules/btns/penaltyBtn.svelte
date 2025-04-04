<script lang="ts">
    import postReq from '$lib/utils/postReq';

    let { fullTitle }: { fullTitle: string } = $props();

    let userName = $derived<string>(fullTitle.split(':').slice(1).join(':'));

    async function warnUser(): Promise<void> {
        const comment = prompt('경고 사유를 입력해 주세요.');
        if (!comment) return;

        const duration = prompt('경고 기간을 입력해 주세요. (단위: 분)');
        if (!duration) return;

        const res = await postReq('/api/penalty/warn', {
            userName,
            duration,
            comment,
        });
        if (res.success) alert('정상적으로 처리되었습니다.');
        else alert(res.result.fullTitle + ': ' + res.result.message);
    }

    async function blockUser(): Promise<void> {
        const comment = prompt('차단 사유를 입력해 주세요.');
        if (!comment) return;

        const duration = prompt('차단 기간을 입력해 주세요. (단위: 분)');
        if (!duration) return;

        const res = await postReq('/api/penalty/block', {
            userName,
            duration,
            comment,
        });
        if (res.success) alert('정상적으로 처리되었습니다.');
        else alert(res.result.fullTitle + ': ' + res.result.message);
    }
</script>

<button onclick={warnUser}>경고</button>
<button onclick={blockUser}>차단</button>
