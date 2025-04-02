import { decodeFullTitle } from 'module-wiki';

export default function modifyHtmlByExistenceOfLinks(html: string, fullTitleArr: string[]): string {
	return html.replaceAll(/href="\/r\/(.*?)"/g, (matched, captured) => {
		if (fullTitleArr.indexOf(decodeFullTitle(captured)) === -1) {
			return `class="nonexistent-link" ${matched}`;
		} else {
			return matched;
		}
	})
}