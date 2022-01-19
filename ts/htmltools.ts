import "loader"
import { LaunchFile } from "./launchfile";

export class Tools {

    private terminalInput:JQuery;
    private body:HTMLElement;
    private terminal:JQuery;
    private terminalHistory:JQuery;

    constructor(){
        this.terminalInput = $('#terminal-input');
        this.terminalInput.trigger('focus');
        this.body = document.body;
        this.terminalHistory = $('#terminal-history');
        this.terminal = $('#terminal-window');
    }

    hideElement(hidden:boolean, element:JQuery){
        if(hidden){
            element.css('display', 'none')
        } else {
            element.css('display', 'flex')
        }
    }
 
    getTerminalInput():JQuery{
        return this.terminalInput;
    }
    

    getTerminal():JQuery{
        return this.terminal;
    }

    rgbContrast(color:string){
        let rgb = color.substr(4, color.length - 5);
        let colorArray = rgb.split(','),
            r = parseInt(colorArray[0]),
            g = parseInt(colorArray[1]),
            b = parseInt(colorArray[2]);
            
        let contrast = (r * 299 + g * 587 + b * 114) / 1000

        return contrast < 255/2 ? 'white' : 'black'
    }

    setWindowColor(newColor:string){
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
        let textCol = this.rgbContrast(rgbColor)
        let titleTextCol = "white"
        let titleCol = "rgba(0,0,0,0.5)"
        if (textCol == "white") {
            titleTextCol = "black"
            titleCol = "rgba(255,255,255,0.5)"
        }

        // Convert rgb to rgba for background transparency
        let rgbaColor = rgbColor.replace(/(?:rgb)+/g, 'rgba');
        rgbaColor = rgbaColor.replace(/(?:\))+/g, ', 0.5)');

        // Set element colors
        $(".window").css('color', textCol)
        $(".window").css("background-color", rgbaColor);
    }

    getTerminalVal():string{
        return String(this.terminalInput.val());
    }

    clearLaunchBox():void{
        this.terminalInput.val('');
    }

    setBackground(background_url:string):void {
        this.body.style.backgroundImage = `url(${background_url})`
    }

    hideTree(hidden:boolean){
        this.hideElement(hidden, $('#tree-wrapper'))

    }

    hideTerminalHistory(hidden:boolean){
        this.hideElement(hidden, this.terminalHistory)
    }

    hideFuzzyList(hidden:boolean){
        this.hideElement(hidden, $('#fuzzy-list'))
    }

    appendLineToTerminalOutput(output:string, prefix:string) {
        this.appendToTerminalOutput([output], prefix);
    }

    appendToTerminalOutput(output:Array<string>, prefix:string){
        // Go through each line, and if not empty add it to history
        for (let i = 0; i < output.length; i++) {
            const outputLine = output[i];
            if(outputLine){
                if(i != 0) {
                    prefix = "&nbsp&nbsp";
                }
                this.terminalHistory.prepend(`<span>${prefix}${outputLine}</span>`);
            }
        }
    }

    showLaunch(){
        $('.app').css('display', 'flex');
        this.terminalInput.focus();
    }

    setTerminalText(text:string){
        this.terminalInput.val(text);
    }

    setSuggestion(text:string){
        $('#suggestion').attr('placeholder', text)
    }

    populateFuzzyList(fuzzyList:LaunchFile[]){
        $('#fuzzy-list').html('')
        fuzzyList.forEach(function(item, i) {
            let fuzzySpan = document.createElement('span')
            fuzzySpan.className = 'fuzzy'
            fuzzySpan.id = `fuzzy-${(i)}`
            fuzzySpan.innerHTML = ` <span class="fuzzy-name">${item.getLocation()}</span><span class="fuzzy-hits">${item.hits}</span>`
            $('#fuzzy-list').append(fuzzySpan);
        });
    }

}