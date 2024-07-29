<script>
    export let fullTitle;
    export let description;
</script>

<article id="headerArticle">
	<div id="titleDiv">
		<h1 id="docTitle">{fullTitle}</h1>
		<span id="docDescription">{description}</span>
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

    #docDescription {
        position: relative;
        top: -.8rem;
		left: .3rem;
    }

</style>