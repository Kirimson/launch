define(["require", "exports", "loader"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Tools {
        constructor() {
            this.console = $('#console');
            this.console.focus();
            this.body = document.body;
            this.consoleHistory = $('#console-history');
            this.terminal = $('#terminal-window');
        }
        getConsole() {
            return this.console;
        }
        getTerminal() {
            return this.terminal;
        }
        rgbContrast(color) {
            let rgb = color.substr(4, color.length - 5);
            let colorArray = rgb.split(','), r = parseInt(colorArray[0]), g = parseInt(colorArray[1]), b = parseInt(colorArray[2]);
            let contrast = (r * 299 + g * 587 + b * 114) / 1000;
            return contrast < 255 / 2 ? 'white' : 'black';
        }
        setWindowColor(newColor) {
            // Create fake div to apply user's color to
            let fakeDiv = document.createElement("div");
            fakeDiv.style.color = newColor;
            document.body.appendChild(fakeDiv);
            // get RBG value of div from color passed
            let contrastColor = window.getComputedStyle(fakeDiv)
                .getPropertyValue("color");
            document.body.removeChild(fakeDiv);
            let windows = $('.window');
            windows.css('background-color', newColor);
            windows.css('color', this.rgbContrast(contrastColor));
        }
        getConsoleVal() {
            return String(this.console.val());
        }
        clearLaunchBox() {
            this.console.val('');
        }
        setBackground(background_url) {
            this.body.style.backgroundImage = `url(${background_url})`;
        }
        hideTree(hidden) {
            let treeWrapper = $('#tree-wrapper');
            if (hidden) {
                treeWrapper.css('display', 'none');
            }
            else {
                treeWrapper.css('display', 'flex');
            }
        }
        addHistory(command) {
            this.consoleHistory.prepend(`<span>$ ${command}</span>`);
        }
        showLaunch() {
            $('.app').css('display', 'flex');
            this.console.focus();
        }
        setConsoleText(text) {
            this.console.val(text);
        }
    }
    exports.Tools = Tools;
});
