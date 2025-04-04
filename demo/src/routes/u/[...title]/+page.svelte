<script lang="ts">
    import DocHeader from '$lib/modules/docHeader.svelte';
    import { parseTime } from '$lib/utils/general.js';
    import {
        type DocLogDoc,
        type PenaltyDoc,
        type PenaltyType,
    } from 'module-wiki';
    import { page } from '$app/state';
    import postReq from '$lib/utils/postReq';
    import { Types } from 'mongoose';
    import LogList from '$lib/modules/logList.svelte';

    let { data } = $props();

    let userGroup = $derived<string | null>(data.userGroup || null);
    let userName = $derived<string>(data.userName as string);
    let logArr = $derived<DocLogDoc[]>(JSON.parse(data.logArr || '[]'));
    let penaltyArr = $derived<PenaltyDoc[]>(
        JSON.parse(data.penaltyArr || '[]')
    );

    function parseType(type: PenaltyType): string {
        if (type === 'block')
            return '<span style="color:red"><b>[차단]</b></span>';
        else if (type === 'warn')
            return '<span style="color:darkorange"><b>[경고]</b></span>';
        else return '기타';
    }

    function parseUntil(until: Date, duration: number): string {
        if (duration === 0)
            return '<span style="color:red"><b>(무기한)</b></span>';
        else return parseTime(until) + ' 까지';
    }

    async function removePenalty(penaltyId: Types.ObjectId) {
        const comment = prompt('취소 사유를 입력해주세요.');
        if (!comment) return;

        const res = await postReq('/api/penalty/remove', {
            penaltyId,
            comment,
        });
        if (res.success) alert('정상적으로 처리되었습니다.');
        else alert(res.result.fullTitle + ': ' + res.result.message);
    }
</script>

<DocHeader fullTitle={`사용자:${userName}`} doc={null} pageType={'user'} />

{#if !userGroup}
    <p>존재하지 않는 사용자입니다.</p>
{:else}
    <h3>권한</h3>
    <p>권한 등급: {userGroup}</p>
    <h3>기여 내역</h3>
    {#if logArr.length === 0}
        <p>기여 내역이 없습니다.</p>
    {:else}
        <LogList fullTitle={`사용자:${userName}`} {logArr} pageType={'user'} />
    {/if}
    <h3>경고 및 차단</h3>
    {#if penaltyArr.length === 0}
        <p>받은 경고 및 차단 사항이 없습니다.</p>
    {:else}
        {#each penaltyArr as penalty, i}
            <div class="penalty-div">
                <span>
                    {@html parseType(penalty.type)} <i>{penalty.comment}</i>
                    <!-- {@html getType(penalty.type)} <span style:color={'grey'}>{penalty.comment}</span> -->
                </span>
                <span>
                    {@html parseUntil(penalty.until, penalty.duration)}
                    {#if ['manager', 'dev'].includes(JSON.parse(page.data.user).group)}
                        <button
                            class="remove-penalty-btn"
                            onclick={() => removePenalty(penalty._id)}
                        >
                            취소
                        </button>
                    {/if}
                </span>
            </div>
        {/each}
    {/if}
{/if}

<style lang="scss">
    .penalty-div {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .remove-penalty-btn {
        padding: 0.1rem 0.5rem;
        font-size: 0.7rem;
    }

    h3 {
        font-size: 2rem;
        margin-top: 2rem;
        margin-bottom: .5rem;
    }
</style>
