<script>
	let doc;

	let title;
	let content;
	let author;
	let comment;
	let history;

	export let data;


	doc = JSON.parse(data.doc);
	console.log(doc);

	title = doc.fullTitle;
	if (doc.history === -1) {
		// Not exist.
		content = '';
		history = 1;
	} else {
		author = doc.author;
		content = doc.content;
		comment = doc.comment;
		history = doc.history + 1;
	}

	function read() {
		location.href = `/r/${doc.fullTitle}`;
	}

	let previewContent = '';
	async function preview() {
		const RES = await fetch('/api/preview', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				content,
			})
		})

		previewContent = await RES.json();
	}

</script>

<article id="headerArticle">
	<div id="titleDiv">
		<h1 id="docTitle">{title}</h1>
		<span id="docHistory">{history}번째 수정판</span>
	</div>

	<div id="btnDiv">
		<button on:click={read}>취소</button>
		<button><label for="saveSubmitBtn">저장</label></button>
	</div>
</article>

<article id="mainArticle">
	<form method="POST">
		<textarea id="docContent" name="content" contenteditable="true" bind:value={content}></textarea>
		<input id="commentInput" name="comment" placeholder="comment">
		<button id="saveSubmitBtn" class="hidden"></button>
	</form>
	<button id="previewBtn" on:click={preview}>미리보기</button>
	<div id="previewDiv" class="kmu" contenteditable="false" bind:innerHTML={previewContent}></div>
</article>

<style lang="scss">

	@import '../../kmu.scss';

	#headerArticle {
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

	#docContent {
		width: -webkit-fill-available;
		height: 50vh ;
		font-size: 1rem;
		padding: .8rem 1rem;
		resize: vertical;
	}

	#commentInput {
		width: -webkit-fill-available;
		font-size: .8rem;
		padding: .2rem .5rem;
	}

	#previewBtn {
		width: -webkit-fill-available;
		margin-top: .5rem;
	}

	#previewDiv {
		margin-top: 1rem;
	}
</style>