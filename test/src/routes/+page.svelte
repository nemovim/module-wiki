<script>

    let title;
    let content;
    let author;
    let comment;

    async function submit() {
        const res = await fetch('/api/write', {
            method: 'POST',
            body: JSON.stringify({
                title: title,
                content: content,
                author: author,
                comment: comment,
            }),
            headers: {
                'content-type': 'application/json'
            }
        });
        console.log(await res.json());
    }
</script>

<h1>KEN-WIKI-TEST</h1>

<form>
    <input type="text" bind:value={title}>
    <input type="text" bind:value={content}>
    <input type="text" bind:value={author}>
    <input type="text" bind:value={comment}>
    <button on:click={submit}>submit</button>
</form>
