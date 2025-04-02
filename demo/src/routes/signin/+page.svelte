<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
</script>

<h1>Welcome to the wiki</h1>
<button onclick={() => signIn('google')}>Sign In with Google</button>
