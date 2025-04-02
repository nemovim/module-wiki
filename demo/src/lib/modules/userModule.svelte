<script lang='ts'>
	import { page } from '$app/state';
	import { signOut } from '@auth/sveltekit/client';
	import { encodeFullTitle, type User } from 'module-wiki';

	let user: User | null = $derived(JSON.parse(page.data.user || null));

</script>

{#if user === null}
	<h3>GUEST</h3>
	<p>Please sign in to explore the wiki</p>
{:else}
    <h3><a href="/u/{encodeFullTitle(user.name)}">{user.name}</a></h3>
	<p>권한: {user.group}</p>
	<button onclick={() => signOut()}>로그아웃</button>
{/if}

<style lang="scss">
	h3 {
		text-align: center;
		// font-weight: normal;
	}
</style>
