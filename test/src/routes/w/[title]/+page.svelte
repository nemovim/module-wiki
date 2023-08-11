<script>
	let title;
	let content;
	let author;
	let comment;

	export let data;

	console.log(data);

	title = data.fullTitle;
	if (data.history === -1) {
		// Not exist.
		content = '';
	} else {
		author = data.author;
		content = data.content;
		comment = data.comment;
	}

	function read() {
		location.href = `/r/${data.fullTitle}`;
	}

	async function save() {
		console.log(`content: ${content}`);
		const res = await fetch('/api/write', {
			method: 'POST',
			body: JSON.stringify({
				title,
				content,
				author,
				comment
			}),
			headers: {
				'content-type': 'application/json'
			}
		});
		console.log(await res.json());
	}
</script>

<h1>Write Test</h1>

<button on:click={read}>Read</button>

<h1>{title}</h1>
<textarea bind:value={content} />

<button on:click={save}>Save</button>
