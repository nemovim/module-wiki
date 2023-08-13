<header>
	<a href="/">
		<span style="color: rgb(0, 50, 104);">K</span><span style="color: rgb(0, 132, 202);">E</span
		><span style="color: rgb(21, 192, 242);">N</span><span>-WIKI</span>
	</a>
</header>
<section id="mainSection">
	<slot />
</section>
<footer>
	<p>Developed by nemovim</p>
</footer>

<style lang="scss">
	#mainSection {
		margin: 1rem;
		height: -webkit-fill-available;
		padding: 1.5rem 2rem;
		border: solid grey 0.1rem;
		background-color: white;
	}

	@mixin xer {
		position: relative;
		padding: 0.3rem;
		right: 0rem;
		display: flex;
		width: -webkit-fill-available;
		background-color: white;
	}

	header {
		@include xer;
		top: 0rem;
		border-bottom: 0.2rem solid black;

		a {
			font-size: 1.6rem;
			margin-top: 0.4rem;
			margin-left: 0.6rem;
            // color: black;
		}

		a:hover {
			text-decoration: none;
		}
	}

	footer {
		@include xer;
		bottom: 0rem;
		justify-content: flex-end;
		border-top: 0.1rem solid black;

		p {
			font-size: 0.6rem;
			margin: 0.2rem;
		}
	}
</style>
