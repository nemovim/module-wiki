<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let user;
	onMount(() => {
		user = JSON.parse($page.data.user);
	});
</script>

{#if user !== undefined}
	<h3>{user.name}</h3>
	<p>권한: {user.authority}</p>
{:else}
	<h3>GUEST</h3>
{/if}

<style lang="scss">
	h3 {
		text-align: center;
		// font-weight: normal;
	}
</style>
