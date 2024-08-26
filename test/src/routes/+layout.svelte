<script>
	import RecentModule from './recentModule.svelte';
	import SearchModule from './searchModule.svelte';
	import UserModule from './userModule.svelte';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { addPopupListener } from '$lib/footnotePopup';

	onMount(() => {
		addPopupListener();
	});

	afterNavigate(() => {
		addPopupListener();
	});


</script>

<header>
	<a href="/">
		<span style="color: rgb(0, 50, 104);">K</span><span style="color: rgb(0, 132, 202);">E</span
		><span style="color: rgb(21, 192, 242);">N</span><span>-WIKI</span>
	</a>
	<SearchModule />
</header>

<div id="mainDiv">
	<section id="mainSection">
		<slot />
	</section>

	<aside id="mainAside">
		<aside>
			<UserModule />
		</aside>
		<aside>
			<h3>수정된 문서</h3>
			<hr />
			<RecentModule />
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
		max-width: 43rem;
		width: -webkit-fill-available;
	}

	#mainAside > aside {
		@include main;
		margin-left: 0;
		min-width: 12vw;
		padding: 1rem;

		h3 {
			text-align: center;
			font-weight: normal;
			margin-top: 0.5rem;
			margin-bottom: 1rem;
		}

		:global(hr) {
			margin: 0.2rem 0;
		}
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
