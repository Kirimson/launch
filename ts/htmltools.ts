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

    setWindowColor(newColor:string){
        let windows = $('.window');

        windows.css('background-color', newColor);
    }

    getLaunchBoxValue():string{
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
            treeWrapper.css('display', 'none')
        } else {
            treeWrapper.css('display', 'flex')
        }
    }

    addHistory(command:string){
        this.consoleHistory.prepend(`<span>$ ${command}</span>`)
    }

    showLaunch(){
        $('.app').css('display', 'flex');
        this.console.focus();
    }

    setText(text:string){
        this.console.val(text)
    }

}