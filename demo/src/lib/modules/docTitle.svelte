<script lang="ts">
    import { encodeFullTitle } from 'module-wiki';
    import type { Doc } from 'module-wiki';
    let { fullTitle, doc, pageType, description }: { fullTitle: string; doc: Doc|null; pageType: pageType, description?: string} = $props();

    function makeDescription(): string {
        if (description != undefined) return description;
        if (pageType === 'read') {
            if (doc === null) {
                return '0번째 수정판';
            } else {
                return doc.revision + '번째 수정판';
            }
        } else if (pageType === 'write') {
            if (doc === null) {
                return '1번째 수정판';
            } else {
                return (doc.revision+1) + '번째 수정판';
            }
        } else if (pageType === 'hist') return '(역사 목록)';
        else if (pageType === 'backlink') return '(역링크 목록)';
        else if (pageType === 'authority') return '(권한 목록)';
        else if (pageType === 'error') return '(오류 또는 권한 부족)';
        else return '';
    }
</script>

<div id="titleDiv">
    <h1 id="docTitle">
        <a href="/r/{encodeFullTitle(fullTitle)}">{fullTitle}</a>
    </h1>
    <span id="docDescription">{makeDescription()}</span>
</div>

<style lang="scss">
    #docTitle {
        font-size: 2.5rem;

        a {
            color: black !important;
        }

        a:hover {
            text-decoration: underline;
            text-underline-offset: 0.4rem;
            text-decoration-thickness: 0.12rem;
        }
    }

    #docDescription {
        position: relative;
        top: -0.6rem;
        left: 0.3rem;
    }
</style>
