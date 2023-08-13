<script>
	let title;
	let content;
	let author;
	let comment;
	let history;

	export let data;

	$: {
		console.log(data);

		title = data.fullTitle;
		if (data.history === -1) {
			// Not exist.
			content = '존재하지 않는 문서입니다.';
            history = 0;
		} else {
			author = data.author;
			content = data.html;
			comment = data.comment;
			history = data.history;
		}
	}

	function write() {
		location.href = `/w/${data.fullTitle}`;
	}

	function checkHistory() {
		location.href = `/h/${data.fullTitle}`;
	}

</script>

<div id="headerDiv">
	<div id="titleDiv">
		<h1 id="docTitle">{title}</h1>
		<span id="docHistory">{history}번째 수정판</span>
	</div>

	<div id="btnDiv">
		<button on:click={write}>편집</button>
		<button on:click={checkHistory}>역사</button>
	</div>
</div>

<article id="mainArticle" class="kmu" contenteditable="false" bind:innerHTML={content} />

<style lang="scss">
	@import 'kmu.scss';

	#headerDiv {
		display: flex;
		align-items: center;
		padding: 1rem;
		justify-content: space-between;
	}

	#docTitle {
		font-size: 2.5rem;

    }

    #docHistory {
        position: relative;
        top: -1rem;
    }

	#mainArticle {
		// padding: 1rem 1.5rem;
	}
</style>
