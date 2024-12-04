<script>
	import { Utils } from 'ken-wiki';
    export let fullTitle;
    export let description;
</script>

<article id="headerArticle">
	<div id="titleDiv">
		<h1 id="docTitle"><a href="/r/{Utils.encodeFullTitle(fullTitle)}">{fullTitle}</a></h1>
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

		a {
			color: black !important;
		}

		a:hover {
			text-decoration: underline;
			text-underline-offset: 0.4rem;
			text-decoration-thickness: 0.12rem;
		}
    }

    #docDescription {
        position: relative;
        top: -.8rem;
		left: .3rem;
    }

</style>