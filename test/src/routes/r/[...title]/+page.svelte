<script>

    let doc;

	let title;
	let content;
	let author;
	let comment;
	let history;

	export let data;

	$: {

        doc = JSON.parse(data.doc);

		console.log(doc);

		title = doc.fullTitle;
		if (doc.history === -1) {
			// Not exist.
			content = '존재하지 않는 문서입니다.';
            history = 0;
		} else {
			author = doc.author;
			content = doc.html;
			comment = doc.comment;
			history = doc.history;
		}
	}

	function write() {
		location.href = `/w/${doc.fullTitle}`;
	}

	function checkHistory() {
		location.href = `/h/${doc.fullTitle}`;
	}

</script>

<article id="headerArticle">
	<div id="titleDiv">
		<h1 id="docTitle">{title}</h1>
		<span id="docHistory">{history}번째 수정판</span>
	</div>

	<div id="btnDiv">
		<button on:click={write}>편집</button>
		<button on:click={checkHistory}>역사</button>
	</div>
</article>

<article id="mainArticle" class="kmu" contenteditable="false" bind:innerHTML={content} />

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

</style>
