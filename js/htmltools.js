define(["require", "exports", "loader"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tools = void 0;
    class Tools {
        constructor() {
            this.terminalInput = $('#terminal-input');
            this.terminalInput.trigger('focus');
            this.body = document.body;
            this.terminalHistory = $('#terminal-history');
            this.terminal = $('#terminal-window');
        }
        hideElement(hidden, element) {
            if (hidden) {
                element.css('display', 'none');
            }
            else {
                element.css('display', 'flex');
            }
        }
        getTerminalInput() {
            return this.terminalInput;
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
            // get RBG value of div from color passed. works with any valid CSS color,
            // even names such as green, orange, etc...
            let rgbColor = window.getComputedStyle(fakeDiv)
                .getPropertyValue("color");
            // remove the fake div, no longer needed
            document.body.removeChild(fakeDiv);
            let textCol = this.rgbContrast(rgbColor);
            let titleTextCol = "white";
            let titleCol = "rgba(0,0,0,0.5)";
            if (textCol == "white") {
                titleTextCol = "black";
                titleCol = "rgba(255,255,255,0.5)";
            }
            // Convert rgb to rgba for background transparency
            let rgbaColor = rgbColor.replace(/(?:rgb)+/g, 'rgba');
            rgbaColor = rgbaColor.replace(/(?:\))+/g, ', 0.5)');
            // Set element colors
            $(".window").css('color', textCol);
            $(".window").css("background-color", rgbaColor);
        }
        getTerminalVal() {
            return String(this.terminalInput.val());
        }
        clearLaunchBox() {
            this.terminalInput.val('');
        }
        setBackground(background_url) {
            this.body.style.backgroundImage = `url(${background_url})`;
        }
        hideTree(hidden) {
            this.hideElement(hidden, $('#tree-wrapper'));
        }
        hideTerminalHistory(hidden) {
            this.hideElement(hidden, this.terminalHistory);
        }
        hideFuzzyList(hidden) {
            this.hideElement(hidden, $('#fuzzy-list'));
        }
        appendLineToTerminalOutput(output, prefix) {
            this.appendToTerminalOutput([output], prefix);
        }
        appendToTerminalOutput(output, prefix) {
            // Go through each line, and if not empty add it to history
            for (let i = 0; i < output.length; i++) {
                const outputLine = output[i];
                if (outputLine) {
                    if (i != 0) {
                        prefix = "&nbsp&nbsp";
                    }
                    this.terminalHistory.prepend(`<span>${prefix}${outputLine}</span>`);
                }
            }
        }
        showLaunch() {
            $('.app').css('display', 'flex');
            this.terminalInput.focus();
        }
        setTerminalText(text) {
            this.terminalInput.val(text);
        }
        setSuggestion(text) {
            $('#suggestion').attr('placeholder', text);
        }
        populateFuzzyList(fuzzyList) {
            $('#fuzzy-list').html('');
            fuzzyList.forEach(function (item, i) {
                let fuzzySpan = document.createElement('span');
                fuzzySpan.className = 'fuzzy';
                fuzzySpan.id = `fuzzy-${(i)}`;
                fuzzySpan.innerHTML = ` <span class="fuzzy-name">${item.getLocation()}</span><span class="fuzzy-hits">${item.hits}</span>`;
                $('#fuzzy-list').append(fuzzySpan);
            });
        }
    }
    exports.Tools = Tools;
});
