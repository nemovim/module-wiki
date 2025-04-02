const popupEvent: EventListener = function (e: Event): void {
    if (!(e.target instanceof HTMLElement)) return;
    const element: HTMLElement = e.target;

    const noteId = element.id.split('-').slice(1).join('-');
    // const notePos = this.getBoundingClientRect();
    // notePos.x += window.pageXOffset;
    // notePos.y += window.pageYOffset;
    showFootnotePopup(element, noteId);
};

const popdownEvent = function (): void {
    document.querySelectorAll('div[id^=popup-]').forEach((element) => {
        element.remove();
    });
};

function showFootnotePopup(note: HTMLElement, noteId: string): void {
    let footnote = document.querySelector(`a#f-${noteId}`)?.parentElement;

    if (!note.parentElement || !footnote) return;

    if (footnote.tagName === 'SUP' && footnote.parentElement) {
        footnote = footnote.parentElement;
    }

    const popup = document.createElement('div');
    popup.setAttribute('id', 'popup-' + noteId);
    popup.append(footnote.cloneNode(true));

    note.parentElement.style.position = 'relative';
    note.parentElement.append(popup);
}

export function addPopupListener() {
    Array(...document.querySelectorAll('a[id^=n-]')).forEach((element) => {
        element.addEventListener('mouseenter', popupEvent);
        element.addEventListener('mouseleave', popdownEvent);
    });
}

export function removePopupListener() {
    Array(...document.querySelectorAll('a[id^=n-]')).forEach((element) => {
        element.removeEventListener('mouseenter', popupEvent);
        element.removeEventListener('mouseleave', popdownEvent);
    });
}
