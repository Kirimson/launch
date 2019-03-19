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
        getLaunchBoxValue() {
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
    }
    exports.Tools = Tools;
});
