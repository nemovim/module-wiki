<script lang="ts">
    import { encodeFullTitle } from 'module-wiki';
    import type { DocLog } from 'module-wiki';
    import { page } from '$app/state';

    let recentChangedLogs: DocLog[] = $derived.by(() => {
        return removeDuplication(JSON.parse(page.data.logs));
    });

    function removeDuplication(logArr: DocLog[]): DocLog[] {
        const fullTitleSet = new Set<string>();
        return logArr.filter((log) => {
            if (fullTitleSet.has(log.fullTitle)) {
                return false;
            } else {
                fullTitleSet.add(log.fullTitle);
                return true;
            }
        });
    }

    function parseTime(time: Date): string {
        const t = new Date(time);
        if (t.getMinutes() < 10) {
            return `${t.getHours()}:0${t.getMinutes()}`;
        } else {
            return `${t.getHours()}:${t.getMinutes()}`;
        }
    }
</script>

{#if page.data.user}
    {#each recentChangedLogs as log, i}
        {#if i <= 10}
            <div>
                <a
                    title={log.fullTitle}
                    href="/r/{encodeFullTitle(log.fullTitle)}"
                    >{log.fullTitle}</a
                >
                <span>{parseTime(log.time)}</span>
            </div>
            <hr />
        {/if}
    {/each}
{/if}

<style lang="scss">
    div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 0.1rem;

        a {
            word-break: break-all;
        }
    }

    :global(hr) {
        border: var(--gray-color1) 0.05em solid;
    }
</style>
