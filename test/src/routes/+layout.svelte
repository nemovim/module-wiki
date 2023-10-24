<script>
	import MiniSearch from 'minisearch';
	import Hangul from 'hangul-js';
	import HangulSearcher from 'hangul-search';


	let searchTitle = '';

	let infoArr = [];

	let hangulSearcher;

	async function getInfoArr() {
		let data = await fetch('/api/info');
		infoArr = await data.json();
		hangulSearcher = new HangulSearcher(infoArr);
	}

	function suggest(title) {
		console.log(hangulSearcher.autoComplete(title));
	}

	function checkEnter(e) {
		if (e.key === 'Enter') {
			search(searchTitle);
		}
	}

	function search(title) {
		location.href = '/s/' + encodeURI(title);
	}

</script>
<header>
	<a href="/">
		<span style="color: rgb(0, 50, 104);">K</span><span style="color: rgb(0, 132, 202);">E</span
		><span style="color: rgb(21, 192, 242);">N</span><span>-WIKI</span>
	</a>
		<input type="text" on:focus={getInfoArr} bind:value={searchTitle} on:input={suggest(searchTitle)} on:keydown={checkEnter}>
		<button on:click={search(searchTitle)}>Search!</button>
</header>

<div id="mainDiv">

<section id="mainSection">
	<slot />
</section>

<aside id="mainAside">
    <aside>
        <p>User Info</p>
    </aside>
    <aside>
        <p>Recently Edited</p>
    </aside>
</aside>

</div>

<footer>
	<p>Developed by nemovim</p>
</footer>

<style lang="scss">
    #mainDiv {
        display: flex;
        justify-content: center;
    }

    @mixin main {
		margin: 1rem;
		height: -webkit-fill-available;
		padding: 1.5rem 2rem;
		border: solid grey 0.1rem;
		background-color: white;
    }

	#mainSection {
        @include main;
        max-width: 40rem;
        width: -webkit-fill-available;
	}

    #mainAside > aside {
        @include main;
        margin-left: 0;
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
