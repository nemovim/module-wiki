<script>

    let title;
    let content;
    let author;
    let comment;

    export let data;

    $: {
        console.log(data);

        title = data.fullTitle;
        if (data.history === -1) {
            // Not exist.
            content = '존재하지 않는 문서입니다.';
        } else {
            author = data.author;
            content = data.html;
            comment = data.comment;
        }
    }

    function write() {
        location.href = `/w/${data.fullTitle}`;
    }


</script>

<h1>Read Test</h1>

<button on:click={write}>Edit(Write)</button>

<h1>{title}</h1>
<article contenteditable="false" bind:innerHTML={content}></article>