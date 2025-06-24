<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from '$app/navigation';
    import { onMount } from "svelte";

    let { data } = $props();

    let title = $state<string>("");
    let markup = $state<string>(data.boilerplate);
    let comment = $state<string>("");
    let loading = $state<boolean>(false);
    let errorMsg = $state<string>('');

    onMount(() => {
        goto(window.location.pathname + window.location.search, { replaceState: false });
    });

</script>

    <h2>파일 업로드</h2>
    <article id="mainArticle">
        <form
            method="POST"
            enctype="multipart/form-data"
            use:enhance={() => {
                loading = true;
                return async ({ result, update }) => {
                    if (result.type === 'failure') {
                        const data = result.data as { message: string };
                        errorMsg = data.message;
                    } else {
                        await update();
                    }
                    loading = false;
                };
            }}
        >
            <input type="file" id="fileInput" name="file" disabled={loading} />
            <input
                id="titleInput"
                placeholder="title"
                bind:value={title}
                name="title"
                disabled={loading}
            />
            <!-- svelte-ignore a11y_autofocus -->
            <textarea
                id="docMarkup"
                contenteditable="true"
                bind:value={markup}
                autofocus
                name="markup"
                disabled={loading}
            ></textarea>
            <input
                id="commentInput"
                placeholder="comment"
                bind:value={comment}
                name="comment"
                disabled={loading}
            />
            <button id="saveBtn" disabled={loading}>
                {#if !loading}
                    업로드
                {:else}
                    업로드 중...
                {/if}
            </button>
        </form>
        {#if errorMsg}
            <p id="errorMsg">{errorMsg}</p>
        {/if}
    </article>

<style lang="scss">
    // @use '../../lib/style/kmu.scss';

    #mainArticle > form {
        display: flex;
        flex-direction: column;

        & > * {
            margin-top: 0.5rem;
        }
    }

    #docMarkup {
        width: -webkit-fill-available;
        height: 50vh;
        font-size: 1rem;
        padding: 0.8rem 1rem;
        resize: vertical;
    }

    #commentInput,
    #titleInput {
        width: -webkit-fill-available;
        font-size: 0.8rem;
        padding: 0.2rem 0.5rem;
    }

    #errorMsg {
        color: red;
        margin-top: 0.5rem;
    }
</style>
