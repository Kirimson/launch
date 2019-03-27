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
        this.consoleHistory = $('#console-history');
        this.terminal = $('#terminal-window');
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
        
        // get RBG value of div from color passed
        let contrastColor = window.getComputedStyle(fakeDiv)
                                  .getPropertyValue("color");
        document.body.removeChild(fakeDiv);
        
        let windows = $('.window');
        windows.css('background-color', newColor);
        windows.css('color', this.rgbContrast(contrastColor))
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
        let treeWrapper = $('#tree-wrapper');
        if(hidden){
            treeWrapper.css('display', 'none');
        } else {
            treeWrapper.css('display', 'flex');
        }
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
        $('#autocomplete').attr('placeholder', text)
    }

}