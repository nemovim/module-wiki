<script lang="ts">
    import { page } from '$app/state';
    import { encodeFullTitle } from 'module-wiki';
    import type { Doc } from 'module-wiki';
    import MoveBtn from './btns/moveBtn.svelte';
    import DeleteBtn from './btns/deleteBtn.svelte';
    import PenaltyBtn from './btns/penaltyBtn.svelte';
    import RenameBtn from './btns/renameBtn.svelte';
    import RegroupBtn from './btns/regroupBtn.svelte';
    let {
        fullTitle,
        doc,
        pageType,
    }: { fullTitle: string; doc: Doc | null; pageType: pageType } = $props();

    let user = $derived(JSON.parse(page.data.user));

    function goToWritePage(): void {
        window.location.href = `/w/${encodeFullTitle(fullTitle)}`;
    }

    function goToHistoryPage(): void {
        window.location.href = `/h/${encodeFullTitle(fullTitle)}`;
    }

    function goToBacklinkPage(): void {
        window.location.href = `/b/${encodeFullTitle(fullTitle)}`;
    }

    function goToAuthorityPage() {
        window.location.href = `/a/${encodeFullTitle(fullTitle)}`;
    }

    function goToReadPage() {
        window.location.href = `/r/${encodeFullTitle(fullTitle)}`;
    }

    // function goToPenaltyPage() {
    //     window.location.href = `/p/${encodeFullTitle(fullTitle)}`;
    // }

    function showGrammar(): void {
        alert(`\\ 문법 취소
**굵게**
//기울임//
~~취소선~~
__밑줄__
[[링크]]
((각주))
# 제목
---- 구분선
:(순서 없는 목록
)(두 번째 항목):
:{순서 있는 목록
}{두 번째 항목}:
:[표(0,0)][칸(0,1)
][칸(1,0)][칸(1,1)]:
더 자세한 문법은 "위키:문법" 문서를 참고하세요.`);
    }
</script>

<div id="btnDiv">
    {#if pageType === 'read'}
        <button onclick={goToWritePage}>편집</button>
        <button onclick={goToHistoryPage}>역사</button>
        <button onclick={goToBacklinkPage}>역링크</button>
        <button onclick={goToAuthorityPage}>권한</button>
    {:else if pageType === 'write'}
        <button onclick={goToReadPage}>취소</button>
        <button onclick={showGrammar}>문법</button>
        <MoveBtn {doc} />
        <DeleteBtn {doc} />
    {:else if pageType === 'error'}
        <button
            onclick={() => {
                window.history.go(-1);
            }}>돌아가기</button
        >
    {:else if pageType === 'hist'}
        <button onclick={goToReadPage}>열람</button>
        <button onclick={goToWritePage}>편집</button>
        <button onclick={goToBacklinkPage}>역링크</button>
        <button onclick={goToAuthorityPage}>권한</button>
    {:else if pageType === 'compare'}
        <button onclick={goToReadPage}>열람</button>
        <button onclick={goToWritePage}>편집</button>
        <button onclick={goToHistoryPage}>역사</button>
        <button onclick={goToBacklinkPage}>역링크</button>
        <button onclick={goToAuthorityPage}>권한</button>
    {:else if pageType === 'authority'}
        <button onclick={goToReadPage}>열람</button>
        <button onclick={goToWritePage}>편집</button>
        <button onclick={goToHistoryPage}>역사</button>
        <button onclick={goToBacklinkPage}>역링크</button>
    {:else if pageType === 'backlink'}
        <button onclick={goToReadPage}>열람</button>
        <button onclick={goToWritePage}>편집</button>
        <button onclick={goToHistoryPage}>역사</button>
        <button onclick={goToAuthorityPage}>권한</button>
    {:else if pageType === 'user'}
        {#if user.name === fullTitle.split(':').slice(1).join(':')}
            <RenameBtn {fullTitle}/>
        {/if}
        {#if ['dev', 'manager'].includes(JSON.parse(page.data.user).group)}
            <PenaltyBtn {fullTitle} />
            <RegroupBtn {fullTitle}/>
        {/if}
    {/if}
</div>

<style lang="scss">
</style>
