<script>
	import { page } from '$app/stores';
	import MainSection from './mainSection.svelte';
    const msg = JSON.parse($page.error.message);
</script>

<MainSection title={msg.fullTitle} revision={msg.revision}>
	<span slot="btns">
		<button
			on:click={() => {
				window.history.go(-1);
			}}>돌아가기</button
		>
	</span>
	<span slot="article">
		<p>{msg.reason}</p>
		<!-- <p>권한이 부족합니다.</p> -->
	</span>
</MainSection>
