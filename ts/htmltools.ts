import "loader"

export class Tools {

    private console:JQuery;
    private body:HTMLElement;
    private terminal:JQuery;
    private consoleHistory:JQuery;

    constructor(){
        this.console = $('#console');
        this.console.focus();
        this.body = document.body;
        this.consoleHistory = $('#terminal-history');
        this.terminal = $('#terminal-window');
    }

    hideElement(hidden:boolean, element:JQuery){
        if(hidden){
            element.css('display', 'none')
        } else {
            element.css('display', 'flex')
        }
    }
 
    getConsole():JQuery{
        return this.console;
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

    getConsoleVal():string{
        return String(this.console.val());
    }

    clearLaunchBox():void{
        this.console.val('');
    }

    setBackground(background_url:string):void {
        this.body.style.backgroundImage = `url(${background_url})`
    }

    hideTree(hidden:boolean){
        this.hideElement(hidden, $('#tree-wrapper'))

    }

    hideConsoleHistory(hidden:boolean){
        this.hideElement(hidden, this.consoleHistory)
    }

    hideFuzzyList(hidden:boolean){
        this.hideElement(hidden, $('#fuzzy-list'))
    }

    addHistory(command:string){
        this.consoleHistory.prepend(`<span>$ ${command}</span>`);
    }

    showLaunch(){
        $('.app').css('display', 'flex');
        this.console.focus();
    }

    setConsoleText(text:string){
        this.console.val(text);
    }

    setSuggestion(text:string){
        $('#suggestion').attr('placeholder', text)
    }

    populateFuzzyList(fuzzyList:string[]){
        $('#fuzzy-list').html('')
        fuzzyList.forEach(function(item, i) {
            let fuzzySpan = document.createElement('span')
            fuzzySpan.className = 'fuzzy'
            fuzzySpan.id = `fuzzy-${(i)}`
            fuzzySpan.innerHTML = ` ${item}`
            $('#fuzzy-list').append(fuzzySpan);
        });
    }

}