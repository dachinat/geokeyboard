const insertAtCaret = (element, content) => {

    const tagName = (element.tagName || element.frameElement.tagName).toLowerCase();

    if (tagName === 'div' || tagName === 'iframe') {
        let sel, range;

        let windowContext = window, documentContext = document;
        if (tagName === 'iframe') {
            windowContext = element.window;
            documentContext = element.document;
        }

        if (windowContext.getSelection) {
            sel = windowContext.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                let el = documentContext.createElement('div');
                el.innerHTML = content;
                let frag = documentContext.createDocumentFragment(), node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);

                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (documentContext.selection && documentContext.selection.type !== 'Control') {
            documentContext.selection.createRange().pasteHTML(content);
        }
    } else if (tagName === 'input' || tagName === 'textarea') {
        if (typeof element.selectionStart === 'number' && typeof element.selectionEnd === 'number') {
            const start = element.selectionStart;
            element.value = element.value.slice(0, start) + content + element.value.slice(element.selectionEnd);
            element.selectionStart = element.selectionEnd = start + 1;
        } else {
            const range = document.selection.createRange();
            let normal = element.value.replace(/\r\n/g, '\n');

            let textInputRange = element.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            let endRange = element.createTextRange();
            endRange.collapse(false);

            let start, end;
            if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
                start = end = charLength;
            } else {
                start = -textInputRange.moveStart('character', -charLength);
                start += normal.slice(0, start).split('\n').length - 1;

                if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
                    end = charLength;
                } else {
                    end = -textInputRange.moveEnd('character', -charLength);
                    end += normal.slice(0, end).split('\n').length - 1;
                }
            }

            element.value = element.value.slice(0, start) + content + element.value.slice(end);
            //start++;

            textInputRange = element.createTextRange();
            textInputRange.collapse(true);
        }
    }
};

module.exports = insertAtCaret;