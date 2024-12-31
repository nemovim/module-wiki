<script>
    import MainSection from '../../mainSection.svelte';
    import { Utils } from 'ken-wiki';

    const encodeFullTitle = Utils.encodeFullTitle;

    let doc;

    let fullTitle;
    let description;
    let content;
    let author;
    let comment;
    let revision;

    export let data;

    $: {
        doc = JSON.parse(data.doc);

        fullTitle = data.fullTitle;

        if (doc === null) {
            // Not exist.
            content = '존재하지 않는 문서입니다.';
            revision = 0;
        } else if (doc.state === 'deleted') {
            content = '존재하지 않는 문서입니다.';
            revision = doc.revision;
        } else {
            author = doc.author;
            content = doc.html;
            comment = doc.comment;
            revision = doc.revision;
        }

        description = revision + '번째 수정판';
    }

    function write() {
        location.href = `/w/${encodeFullTitle(fullTitle)}`;
    }

    function checkHistory() {
        location.href = `/h/${encodeFullTitle(fullTitle)}`;
    }
</script>

<MainSection {fullTitle} {description}>
    <span slot="btns">
        <button on:click={write}>편집</button>
        <button on:click={checkHistory}>역사</button>
    </span>

    <span slot="article">
        <article
            id="mainArticle"
            class="kmu"
            contenteditable="false"
            bind:innerHTML={content}
        ></article>
    </span>
</MainSection>

<style lang="scss">
	@use '../../../lib/style/kmu.scss';
</style>
