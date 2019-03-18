import "loader"

export class Tools {

    private console:JQuery;
    private body:HTMLElement;

    constructor(){
        this.console = $('#console');
        this.console.focus();
        this.body = document.body
    }

    getLaunchBox():JQuery{
        return this.console;
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

}