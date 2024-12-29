<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { signOut } from '@auth/sveltekit/client';

	let user;
	onMount(() => {
		if ($page.data.user) {
			user = JSON.parse($page.data.user);
		} else {
			user = null;
		}
	});
</script>

{#if user === undefined}
	<h3>불러오는 중...</h3>
{:else if user === null}
	<h3>GUEST</h3>
	<p>Please sign in to explore the wiki</p>
{:else}
	<h3>{user.name}</h3>
	<p>권한: {user.authority}</p>
	<button on:click={signOut}>로그아웃</button>
{/if}

<style lang="scss">
	h3 {
		text-align: center;
		// font-weight: normal;
	}
</style>
