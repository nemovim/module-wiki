<script>
    export let title;
    export let revision;
</script>

<article id="headerArticle">
	<div id="titleDiv">
		<h1 id="docTitle">{title}</h1>
		<span id="docRevision">{revision}번째 수정판</span>
	</div>

	<div id="btnDiv">
        <slot name="btns"></slot>
	</div>
</article>

<slot name="article"></slot>

<style lang="scss">
	#headerArticle {
		display: flex;
		align-items: center;
		padding: 1rem;
		justify-content: space-between;
	}

	#docTitle {
		font-size: 2.5rem;

    }

    #docRevision {
        position: relative;
        top: -.8rem;
		left: .3rem;
    }

</style>