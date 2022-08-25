document.addEventListener('DOMContentLoaded', function() {
    // key for out history item
    var historyKey = -1;

    // create history array in json
    localStorage.setItem('history', '[]');

    var intervalFlashCursor = null;

    var maxLengthCommand = 70;

    var lineHTML = '<div class="line">' +
        '<span class="before">guest@devtn.ru:/menu$</span>' +
        '<span class="command" role="textbox" contenteditable autofocus></span>' +
        '<span class="cursor"></span>' +
    '</div>';

    var borderStyle = '4px solid #fff';

    var bar = document.querySelector('.bar');
    var screen = document.querySelector('.screen');

    // add first command line
    screen.innerHTML += lineHTML;

    function getTerminal() {
        return document.querySelector('.terminal');
    }

    function getLastLine() {
        return document.querySelectorAll('.line')[document.querySelectorAll('.line').length - 1];
    }

    function getLastBefore() {
        return document.querySelectorAll('.before')[document.querySelectorAll('.before').length - 1];
    }

    function getLastCommand() {
        return document.querySelectorAll('.command')[document.querySelectorAll('.command').length - 1];
    }

    function getLastCursor() {
        return document.querySelectorAll('.cursor')[document.querySelectorAll('.cursor').length - 1];
    }

    function getWidthCharacter() {
        var widthCharacter = getLastCommand().offsetWidth / getLastCommand().textContent.length;
        return !isNaN(widthCharacter) ? widthCharacter : 0;
    }

    function getLastBeforeWidth() {
        return getLastBefore().offsetWidth + parseFloat(getComputedStyle(getLastLine()).gridGap, 10);
    }

    // button close
    // document.querySelector('.button.red').addEventListener('click', closeTerminal);

    function closeTerminal() {
        getTerminal().remove();
    }

    // button hide
    // document.querySelector('.button.yellow').addEventListener('click', openHideTerminal);
    document.querySelector('.app-bar').addEventListener('click', openHideTerminal);

    function openHideTerminal() {
        if (document.querySelector('.terminal.hide') !== null) {
            getTerminal().classList.remove('hide');
            document.querySelector('.app-bar').classList.add('hide');

            getLastCommand().focus();
            positionCursorToEndString();
        } else {
            getTerminal().classList.add('hide');
            document.querySelector('.app-bar').classList.remove('hide');
        }
    }

    // button open to full window
    // document.querySelector('.button.green').addEventListener('click', openToFullWindow);

    function openToFullWindow() {
        if (document.querySelector('.terminal.full-window') !== null) {
            getTerminal().classList.remove('full-window');
            document.querySelector('.bar .button.green').classList.remove('full-window');
        } else {
            getTerminal().classList.add('full-window');
            document.querySelector('.bar .button.green').classList.add('full-window');
        }

        positionCursorToEndString();
    }

    document.querySelector('div:not(.app-bar)').addEventListener('click', event => {
        clearInterval(intervalFlashCursor);

        if (getTerminal() !== null) {
            getLastCursor().style.border = borderStyle;

            if (event.target.closest('.terminal')) {
                clearInterval(intervalFlashCursor);
                getLastCommand().focus();
                flashCursor();
            }
        }
    });

    document.addEventListener('keydown', function(event) {
        switch (true) {
            case event.keyCode === 37:
                moveCursorLeft();
                break;
            case event.keyCode === 39:
                moveCursorRight();
                break;
            case event.keyCode === 38:
                historyPrev(event);
                break;
            case event.keyCode === 40:
                historyNext();
                break;
            case event.keyCode === 13:
                addNewLine(event);
                break;
            case event.keyCode >= 65 && event.keyCode <= 90 && getLastCommand().textContent.length > maxLengthCommand:
                event.preventDefault();
                break;
        }
    });

    function init() {
        initMoveMouseCommand();

        clearInterval(intervalFlashCursor);
        flashCursor();

        getLastCommand().focus();

        // default margin left for cursor
        getLastCursor().style.marginLeft = getLastBeforeWidth() + 'px';
    }

    function initMoveMouseCommand() {
        getLastCommand().addEventListener('input', event => {
            if ((getLastBeforeWidth() + getLastCommand().offsetWidth) > parseFloat(getLastCursor().style.marginLeft, 10)) {
                moveCursorRight();
            } else {
                moveCursorLeft();
            }
        });
    }

    function flashCursor() {
        intervalFlashCursor = setInterval(function () {
            if (getLastCursor().style.border === 'none') {
                getLastCursor().style.border = borderStyle;
            } else {
                getLastCursor().style.border = 'none';
            }
        }, 600);
    }

    function moveCursorLeft() {
        var current = parseFloat(getComputedStyle(getLastCursor()).marginLeft, 10);
        var moveWidth;

        if (getWidthCharacter() !== 0) {
            moveWidth = current - getWidthCharacter();
        } else {
            moveWidth = getLastBefore().offsetWidth + parseFloat(getComputedStyle(getLastLine()).gridGap, 10);
        }

        if (getLastBefore().offsetWidth < moveWidth) {
            getLastCursor().style.marginLeft = moveWidth + 'px';
        }
    }

    function moveCursorRight() {
        var current = parseFloat(getComputedStyle(getLastCursor()).marginLeft, 10);
        var moveWidth = current + getWidthCharacter();
        var maxWidth = getLastBefore().offsetWidth + getLastCommand().offsetWidth + getWidthCharacter();

        if (maxWidth > moveWidth) {
            getLastCursor().style.marginLeft = moveWidth + 'px';
        }
    }

    function addNewLine(event) {
        event.preventDefault();

        addToHistory();

        getLastCursor().style.border = 'none';

        var lastCommand = getLastCommand().textContent;

        switch (lastCommand) {
            case 'ls -l':
                var menu = document.querySelector('.menu').cloneNode(true);
                screen.innerHTML += menu.outerHTML;
                document.querySelectorAll('.menu')[document.querySelectorAll('.menu').length - 1].style.display = 'block';
                break;
            default:
                screen.innerHTML += '<div class="command-404">command not found</div>';
                break;
        }
        screen.innerHTML += lineHTML;

        init();
    }

    function getHistory() {
        var history = localStorage.getItem('history');
        return JSON.parse(history);
    }

    function addToHistory() {
        var lastCommand = getLastCommand().textContent;

        if (lastCommand != '') {
            var historyArr = getHistory();
            historyArr.push(lastCommand);
            localStorage.setItem('history', JSON.stringify(historyArr));
            historyKey = historyArr.length;
        }
    }

    function historyPrev(event) {
        event.preventDefault();

        var historyArr = getHistory();

        if (historyKey >= 0) {
            historyKey--;
        }

        if (typeof historyArr[historyKey] === "undefined") {
            historyKey++;
        }

        getLastCommand().textContent = historyArr[historyKey];

        getLastCursor().style.marginLeft = getLastBeforeWidth() + 'px';

        for (var i = 0; i < getLastCommand().textContent.length; i++) {
            moveCursorRight();
        }

        positionCursorToEndString();
    }

    function positionCursorToEndString() {
        // if text field not empty
        if (getLastCommand().childNodes.length > 0) {
            // Creates range object
            var setpos = document.createRange();
            
            // Creates object for selection
            var set = window.getSelection();
            
            // Set start position of range
            setpos.setStart(getLastCommand().childNodes[0], getLastCommand().textContent.length);
            
            // Collapse range within its boundary points
            // Returns boolean
            setpos.collapse(true);
            
            // Remove all ranges set
            set.removeAllRanges();
            
            // Add range with respect to range object.
            set.addRange(setpos);
            
            // Set cursor on focus
            getLastCommand().focus();
        }
    }

    function historyNext() {
        var historyArr = getHistory();

        if (historyKey < historyArr.length) {
            historyKey++;
        }

        getLastCommand().textContent = typeof historyArr[historyKey] !== "undefined" ? historyArr[historyKey] : "";

        getLastCursor().style.marginLeft = getLastBeforeWidth() + 'px';

        for (var i = 0; i < getLastCommand().textContent.length; i++) {
            moveCursorRight();
        }
    }

    // move terminal animation
    bar.onmousedown = function(event) {
        // not full window
        if (getTerminal().classList.contains('full-window')) {
            return;
        }

        // not left click mouse
        if (event.which !== 1) {
            return;
        }

        // not click on child elements
        if (event.target !== this) {
            return;
        }

        coords = getCoords(getTerminal());
        var shiftX = event.pageX - coords.left;
        var shiftY = event.pageY - coords.top;

        getTerminal().style.position = 'absolute';
        document.body.appendChild(getTerminal());
        moveAt(event);

        getTerminal().style.zIndex = 1000;

        function moveAt(event) {
            switch (true) {
                case coords.left <= 0:
                    getTerminal().style.left = '1px';
                    getTerminal().style.top = event.pageY - shiftY + 'px';
                    break;
                case coords.top <= 0:
                    getTerminal().style.left = event.pageX - shiftX + 'px';
                    getTerminal().style.top = '1px';
                    break;
                case (document.querySelector('body').offsetWidth - getTerminal().offsetWidth - coords.left) <= 0:
                    getTerminal().style.left = (document.querySelector('body').offsetWidth - getTerminal().offsetWidth - 1) + 'px';
                    getTerminal().style.top = event.pageY - shiftY + 'px';
                    break;
                case (document.querySelector('body').offsetHeight - getTerminal().offsetHeight - coords.top) <= 0:
                    getTerminal().style.left = event.pageX - shiftX + 'px';
                    getTerminal().style.top = (document.querySelector('body').offsetHeight - getTerminal().offsetHeight - 1) + 'px';
                    break;
                default:
                    getTerminal().style.left = event.pageX - shiftX + 'px';
                    getTerminal().style.top = event.pageY - shiftY + 'px';
                    break;
            }
        }

        document.onmousemove = function(event) {
            coords = getCoords(getTerminal());
            moveAt(event);

            clearInterval(intervalFlashCursor);
            getLastCursor().style.border = borderStyle;
        };

        bar.onmouseup = function() {
            document.onmousemove = null;
            bar.onmouseup = null;
        };
    }

    bar.ondragstart = function() {
        return false;
    };

    function getCoords(elem) {
        var box = elem.getBoundingClientRect();
        return {
            top: box.top + pageYOffset,
            left: box.left + pageXOffset
        };
    }

    init();

    const BORDER_SIZE = 4;

    let m_pos;
    function resizeLeft(e){
        const dx = m_pos - e.x;
        m_pos = e.x;
        var newWidth = parseFloat(getComputedStyle(getTerminal(), '').width, 10) + dx;
        getTerminal().style.right = document.querySelector('body').offsetWidth - parseFloat(getComputedStyle(getTerminal(), '').left, 10) - getTerminal().offsetWidth + 'px';
        getTerminal().style.left = "";
        if (parseFloat(getComputedStyle(getTerminal()).left, 10) < 0) {
            getTerminal().style.width = getTerminal().offsetWidth + 'px';
            getTerminal().style.left = "0px";
        } else {
            getTerminal().style.width = newWidth + 'px';
        }
    }

    function resizeRight(e){
        const dx = m_pos - e.x;
        m_pos = e.x;
        var newWidth = parseFloat(getComputedStyle(getTerminal(), '').width, 10) - dx;
        getTerminal().style.left = document.querySelector('body').offsetWidth - parseFloat(getComputedStyle(getTerminal(), '').right, 10) - getTerminal().offsetWidth + 'px';
        getTerminal().style.right = "";
        if (parseFloat(getComputedStyle(getTerminal()).right, 10) < 0) {
            getTerminal().style.width = getTerminal().offsetWidth + 'px';
            getTerminal().style.right = "0px";
        } else {
            getTerminal().style.width = newWidth + 'px';
        }
    }

    function resizeTop(e){
        const dy = m_pos - e.y;
        m_pos = e.y;
        var newHeight = parseFloat(getComputedStyle(getTerminal(), '').height, 10) + dy;
        getTerminal().style.bottom = document.querySelector('body').offsetHeight - parseFloat(getComputedStyle(getTerminal(), '').top, 10) - getTerminal().offsetHeight + 'px';
        getTerminal().style.top = "";
        if (parseFloat(getComputedStyle(getTerminal()).top, 10) < 0) {
            getTerminal().style.height = getTerminal().offsetHeight + 'px';
            getTerminal().style.top = "0px";
        } else {
            getTerminal().style.height = newHeight + 'px';
        }
    }

    function resizeBottom(e){
        const dy = m_pos - e.y;
        m_pos = e.y;
        var newHeight = parseFloat(getComputedStyle(getTerminal(), '').height, 10) - dy;
        getTerminal().style.top = document.querySelector('body').offsetHeight - parseFloat(getComputedStyle(getTerminal(), '').bottom, 10) - getTerminal().offsetHeight + 'px';
        getTerminal().style.bottom = "";
        if (parseFloat(getComputedStyle(getTerminal()).bottom, 10) < 0) {
            getTerminal().style.height = getTerminal().offsetHeight + 'px';
            getTerminal().style.bottom = "0px";
        } else {
            getTerminal().style.height = newHeight + 'px';
        }
    }

    getTerminal().addEventListener("mousedown", function(e){
        e.preventDefault();

        // not full window
        if (getTerminal().classList.contains('full-window')) {
            return;
        }

        if (e.offsetX < BORDER_SIZE) {
            m_pos = e.x;
            document.addEventListener("mousemove", resizeLeft, false);
        }

        if (e.offsetX > (getTerminal().offsetWidth - 4)) {
            m_pos = e.x;
            document.addEventListener("mousemove", resizeRight, false);
        }
    }, false);

    document.querySelector('.resize-top').addEventListener("mousedown", function(e){
        e.preventDefault();

        // not full window
        if (getTerminal().classList.contains('full-window')) {
            return;
        }

        if (e.offsetY < BORDER_SIZE) {
            m_pos = e.y;
            document.addEventListener("mousemove", resizeTop, false);
        }
    }, false);

    document.querySelector('.resize-bottom').addEventListener("mousedown", function(e){
        e.preventDefault();

        // not full window
        if (getTerminal().classList.contains('full-window')) {
            return;
        }

        if (e.offsetY < (getTerminal().offsetHeight - 4)) {
            m_pos = e.y;
            document.addEventListener("mousemove", resizeBottom, false);
        }
    }, false);

    document.addEventListener("mouseup", function(){
        document.removeEventListener("mousemove", resizeLeft, false);
        document.removeEventListener("mousemove", resizeRight, false);
        document.removeEventListener("mousemove", resizeTop, false);
        document.removeEventListener("mousemove", resizeBottom, false);
    }, false);
});
