<script>
	import { page } from '$app/stores';
	import MainSection from './mainSection.svelte';
	const error = JSON.parse($page.error.message);
	console.error(error.errorStack);
</script>

<MainSection fullTitle={error.fullTitle} description={"(오류 또는 권한 부족)"}>
	<span slot="btns">
		<button
			on:click={() => {
				window.history.go(-1);
			}}>돌아가기</button
		>
	</span>
	<span slot="article">
		<p>{error.errorTitle}</p>
		<!-- <p>권한이 부족합니다.</p> -->
	</span>
</MainSection>
