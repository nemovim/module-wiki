const popupEvent = function () {
    const noteId = this.id.split('-').slice(1).join('-');
    // const notePos = this.getBoundingClientRect();
    // notePos.x += window.pageXOffset;
    // notePos.y += window.pageYOffset;
    showFootnotePopup(this, noteId);
};

const popdownEvent = function () {
    document.querySelectorAll('div[id^=popup-]').forEach((element) => {
        element.remove();
    });
};

function showFootnotePopup(note, noteId) {
    let footnote = document.querySelector(`a#f-${noteId}`).parentElement;

    if (footnote.tagName === 'SUP') {
        footnote = footnote.parentElement;
    }

    footnote = footnote.cloneNode(true);

    const popup = document.createElement('div');
    popup.setAttribute('id', 'popup-' + noteId);
    popup.append(footnote);

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
