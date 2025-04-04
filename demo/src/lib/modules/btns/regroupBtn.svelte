<script lang="ts">
    import postReq from '$lib/utils/postReq';

    let { fullTitle }: { fullTitle: string } = $props();

    let userName = $derived<string>(fullTitle.split(':').slice(1).join(':'));

    async function regroupUser(): Promise<void> {
        const group = prompt('새롭게 지정할 그룹 이름을 입력하세요.');
        if (!group) return;

        const res = await postReq('/api/regroup', { userName, group });

        if (res.success) alert('정상적으로 처리되었습니다.');
        else alert(res.result.fullTitle + ': ' + res.result.message);
    }
</script>

<button onclick={regroupUser}>권한</button>
