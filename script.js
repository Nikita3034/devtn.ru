document.addEventListener('DOMContentLoaded', function(){

    // var widthСharacter = 9.03;
    var widthСharacter = 8.25;

    var historyKey = -1;

    localStorage.setItem('history', '[]');

    var currentLengthInput = 0;

    var intervalFlashCursor = null;

    var maxLengthCommand = 70;

    var lineHTML = '<div class="line">' +
        '<span class="before">guest@devtn.ru:~$</span>' +
        '<span class="command" role="textbox" contenteditable autofocus></span>' +
        '<span class="cursor"></span>' +
    '</div>';

    var defaultBeforeTextWidth = document.querySelector('.before').offsetWidth;
    var defaultLineWidth = document.querySelector('.line').offsetWidth;

    function getLastCommand() {
        return document.querySelectorAll('.command')[document.querySelectorAll('.command').length - 1];
    }

    function getLastCursor() {
        return document.querySelectorAll('.cursor')[document.querySelectorAll('.cursor').length - 1];
    }

    init();

    document.querySelector('.button.green').addEventListener('click', event => {
        if (document.querySelector('.terminal.full-window') !== null) {
            document.querySelector('.terminal').classList.remove('full-window');
        } else {
            document.querySelector('.terminal').classList.add('full-window');
        }
    });

    document.addEventListener('click', event => {

        clearInterval(intervalFlashCursor);
        getLastCursor().style.border = '4px solid #fff';

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
                historyPrev();
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
        currentLengthInput = 0;
        initMoveMouseCommand();

        clearInterval(intervalFlashCursor);
        flashCursor();

        getLastCommand().focus();
    }

    function initMoveMouseCommand() {
        getLastCommand().addEventListener('input', event => {
            if (event.target.textContent.length > currentLengthInput ) {
                moveCursorRight();
            } else {
                moveCursorLeft();
            }

            currentLengthInput = event.target.textContent.length;
        });
    }

    function flashCursor() {
        intervalFlashCursor = setInterval(function () {
            if (getLastCursor().style.border === 'none') {
                getLastCursor().style.border = '4px solid #fff';
            } else {
                getLastCursor().style.border = 'none';
            }
        }, 600);
    }

    function moveCursorLeft() {
        var current = parseFloat(getComputedStyle(getLastCursor()).marginLeft, 10);
        var moveWidth = current - widthСharacter;

        if (defaultBeforeTextWidth < moveWidth) {
            getLastCursor().style.marginLeft = moveWidth + 'px';
        }
    }

    function moveCursorRight() {
        var current = parseFloat(getComputedStyle(getLastCursor()).marginLeft, 10);
        var moveWidth = current + widthСharacter;

        if (defaultLineWidth > moveWidth) {
            getLastCursor().style.marginLeft = moveWidth + 'px';
        }
    }

    function addNewLine(event) {
        event.preventDefault();

        addToHistory();

        document.querySelector('.screen .cursor').remove();
        document.querySelector('.screen').innerHTML += lineHTML;

        init();
    }

    function getHistory()
    {
        var history = localStorage.getItem('history');
        return JSON.parse(history);
    }

    function addToHistory()
    {
        var lastCommand = getLastCommand().innerHTML;

        if (lastCommand != '') {
            var historyArr = getHistory();
            historyArr.push(lastCommand);
            localStorage.setItem('history', JSON.stringify(historyArr));
            historyKey = historyArr.length - 1;
        }
    }

    function historyNext() {
        var historyArr = getHistory();

        if (typeof historyArr[historyKey] !== "undefined") {

            if (
                typeof historyArr[historyKey + 1] !== "undefined" &&
                getLastCommand().innerHTML == historyArr[historyKey]
            ) {
                historyKey++;
            }

            getLastCommand().innerHTML = historyArr[historyKey];
            if (historyKey < historyArr.length - 1) {
                historyKey++;
            }

            getLastCursor().style.marginLeft = defaultBeforeTextWidth + 5 + 'px';

            for (var i = 0; i < getLastCommand().textContent.length; i++) {
                moveCursorRight();
            }
        }
    }

    function historyPrev() {
        var historyArr = getHistory();

        if (typeof historyArr[historyKey] !== "undefined") {

            if (
                typeof historyArr[historyKey - 1] !== "undefined" &&
                getLastCommand().innerHTML == historyArr[historyKey]
            ) {
                historyKey--;
            }

            getLastCommand().innerHTML = historyArr[historyKey];

            if (historyKey > 0 && historyKey < historyArr.length) {
                historyKey--;
            }

            getLastCursor().style.marginLeft = defaultBeforeTextWidth + 5 + 'px';

            for (var i = 0; i < getLastCommand().textContent.length; i++) {
                moveCursorRight();
            }
        }
    }

    // move terminal animation
    var bar = document.querySelector('.bar');
    var terminal = document.querySelector('.terminal');

    bar.onmousedown = function(event) {

        if (terminal.classList.contains('full-window')) {
            return;
        }

        // if not kleft click mouse
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
});