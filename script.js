document.addEventListener('DOMContentLoaded', function() {
    // key for out history item
    var historyKey = -1;

    // create history array in json
    localStorage.setItem('history', '[]');

    var intervalFlashCursor = null;

    var maxLengthCommand = 70;

    var lineHTML = '<div class="line">' +
        '<span class="before">guest@devtn.ru:~$</span>' +
        '<span class="command" role="textbox" contenteditable autofocus></span>' +
        '<span class="cursor"></span>' +
    '</div>';

    var borderStyle = '4px solid #fff';

    var bar = document.querySelector('.bar');
    var terminal = document.querySelector('.terminal');
    var screen = document.querySelector('.screen');

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

    document.querySelector('.button.green').addEventListener('click', event => {
        if (document.querySelector('.terminal.full-window') !== null) {
            document.querySelector('.terminal').classList.remove('full-window');
        } else {
            document.querySelector('.terminal').classList.add('full-window');
        }
    });

    document.addEventListener('click', event => {

        clearInterval(intervalFlashCursor);
        getLastCursor().style.border = borderStyle;

        if (event.target.closest('.terminal')) {
            getLastCommand().focus();
            flashCursor();
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
        if (terminal.classList.contains('full-window')) {
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

        var coords = getCoords(terminal);
        var shiftX = event.pageX - coords.left;
        var shiftY = event.pageY - coords.top;

        terminal.style.position = 'absolute';
        document.body.appendChild(terminal);
        moveAt(event);

        terminal.style.zIndex = 1000;

        function moveAt(event) {
            terminal.style.left = event.pageX - shiftX + terminal.offsetWidth / 2 + 'px';
            terminal.style.top = event.pageY - shiftY + 'px';
        }

        document.onmousemove = function(event) {
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
});
