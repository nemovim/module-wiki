<script>
    export let diff;

    function parseWhiteSpaces(content) {
        return content.replaceAll('\n', '<br>');
    }
</script>

{#if diff === null}
	<p>존재하지 않는 문서입니다.</p>
{:else}
    <pre>
        {#each diff as part}
            {#if part.added}
                <span class="added">{part.value}</span>
            {:else if part.removed}
                <span class="removed">{part.value}</span>
            {:else}
                <span>{part.value}</span>
            {/if}
        {/each}
    </pre>
{/if}

<style lang="scss">

    pre {
        white-space: pre-line;
        padding: 1rem;
        border: .1rem black solid;
    }

    @mixin changed {
        // padding: .2rem;
    }

    .added {
        @include changed;
        background-color: rgba(0, 255, 0, 0.2);
        color: darkgreen;
    }

    .removed {
        @include changed;
        text-decoration-line: line-through;
        background-color: rgba(255, 0, 0, 0.2);
        color: maroon;
    }
</style>