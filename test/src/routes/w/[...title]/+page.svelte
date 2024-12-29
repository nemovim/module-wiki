<script>
	import MainSection from '../../mainSection.svelte';
	import { addPopupListener, removePopupListener } from '$lib/footnotePopup';
	import { page } from '$app/stores';
	import { Utils } from 'ken-wiki';
	import { onMount } from 'svelte';

	const encodeFullTitle = Utils.encodeFullTitle;

	let markup;
	let comment;
	let revision;
	let type;
	let categorizedArr;
	let previewHTML;

	const user = JSON.parse($page.data.user);

	export let data;

	const fullTitle = data.fullTitle;
	const doc = JSON.parse(data.doc);

	if (doc === null) {
		// Not exist.
		markup = '';
		revision = 1;
		if (fullTitle.split(':')[0] === '분류') {
			type = 'category';
		} else {
			type = 'general';
		}
		categorizedArr = [];
	} else {
		markup = doc.markup;
		revision = doc.revision + 1;
		type = doc.type;
		if (type === 'category') {
			categorizedArr = doc.categorizedArr;
		} else {
			categorizedArr = [];
		}
	}

	function readDoc() {
		location.href = `/r/${encodeFullTitle(fullTitle)}`;
	}

	async function previewDoc() {
		removePopupListener();

		const res = await fetch('/api/common/preview', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				markup,
				type,
				categorizedArr
			})
		});

		const previewDiv = document.getElementById('previewDiv');
		previewDiv.innerHTML = await res.json();
		addPopupListener();
	}

	function showMarkup() {
		alert('개발중');
		return true;
	}

	async function deleteDoc() {
		if (doc === null) {
			alert('존재하지 않는 문서입니다.');
		} else {
			const res = await fetch('/api/authority', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					doc,
					actionType: 'delete'
				})
			});

			if (await res.json()) {
				if (confirm('정말로 삭제하시겠습니까?')) {
					let deleteComment = prompt('삭제하는 이유를 간략하게 적어주세요.');

					if (deleteComment === null) {
						deleteComment = '';
					}

					const res = await fetch('/api/delete', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							fullTitle,
							comment: deleteComment
						})
					});

					const result = await res.json();
					if (result?.error) {
						alert(result.msg);
					} else {
						alert('삭제가 완료되었습니다.');
						location.href = `/r/${encodeFullTitle(fullTitle)}`;
					}
				} else {
					alert('삭제가 취소되었습니다.');
				}
			} else {
				alert('권한이 부족합니다.');
			}
		}
	}

	async function moveDoc() {
		if (doc === null) {
			alert('존재하지 않는 문서입니다.');
		} else {
			const res = await fetch('/api/authority', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					doc,
					actionType: 'update'
				})
			});

			if (await res.json()) {
				const newTitle = prompt('새로운 문서 제목을 입력해 주세요.');
				if (newTitle) {
					const res = await fetch('/api/update', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							fullTitle,
							newInfo: {
								fullTitle: newTitle
							}
						})
					});

					const result = await res.json();
					if (result?.error) {
						alert(result.msg);
					} else {
						alert('이동이 완료되었습니다.');
						location.href = `/r/${encodeFullTitle(newTitle)}`;
					}
				} else {
					alert('이동이 취소되었습니다.');
				}
			} else {
				alert('권한이 부족합니다.');
			}
		}
	}

	async function manageDoc() {
		if (doc === null) {
			alert('존재하지 않는 문서입니다.');
		} else {
			const res = await fetch('/api/authority', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					doc,
					actionType: 'authority'
				})
			});

			if (await res.json()) {
				let answer = prompt(
					`수정된 권한을 공백으로 분리하여 순서대로 입력해 주세요.\n(열람: ${doc.authorityObj.read} | 편집: ${doc.authorityObj.write} | 수정: ${doc.authorityObj.update} | 삭제: ${doc.authorityObj.delete})`
				);
				if (answer) {
					answer = answer.split(' ');
					const authorityObj = {
						read: answer[0],
						write: answer[1],
						update: answer[2],
						delete: answer[3]
					};
					const res = await fetch('/api/update', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							fullTitle,
							newInfo: {
								authorityObj
							}
						})
					});

					const result = await res.json();
					if (result?.error) {
						alert(result.msg);
					} else {
						alert('수정이 완료되었습니다.');
						location.href = `/r/${encodeFullTitle(fullTitle)}`;
					}
				} else {
					alert('수정이 취소되었습니다.');
				}
			} else {
				alert('권한이 부족합니다.');
			}
		}
	}

	onMount(() => {
		document.getElementById('docMarkup').focus();
	});

</script>

<MainSection {fullTitle} description={`${revision}번째 편집`}>
	<span slot="btns">
		<button on:click={readDoc}>취소</button>
		{#if user.authority >= 100}
			<button on:click={manageDoc}>권한</button>
		{/if}
		<button on:click={showMarkup}>문법</button>
		<button on:click={deleteDoc}>삭제</button>
		<button on:click={moveDoc}>이동</button>
		<form method="POST" style="display: inline-block">
			<textarea name="markup" bind:value={markup} class="hidden" />
			<input name="comment" bind:value={comment} class="hidden" />
			<button>저장</button>
		</form>
	</span>

	<span slot="article">
		<article id="mainArticle">
			<textarea id="docMarkup" contenteditable="true" bind:value={markup} />
			<input id="commentInput" placeholder="comment" bind:value={comment} />
			<button id="previewBtn" on:click={previewDoc}>미리보기</button>
			<div id="previewDiv" class="kmu" contenteditable="false" />
		</article>
	</span>
</MainSection>

<style lang="scss">
	@import '../../../lib/style/kmu.scss';

	#docMarkup {
		width: -webkit-fill-available;
		height: 50vh;
		font-size: 1rem;
		padding: 0.8rem 1rem;
		resize: vertical;
	}

	#commentInput {
		width: -webkit-fill-available;
		font-size: 0.8rem;
		padding: 0.2rem 0.5rem;
	}

	#previewBtn {
		width: -webkit-fill-available;
		margin-top: 0.5rem;
	}

	#previewDiv {
		margin-top: 1rem;
	}
</style>
