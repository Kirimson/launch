import { Launcher } from "launch"
import {Tools} from "htmltools"
import { Tree } from "./tree";

function isUrl(text:string):boolean{
    let pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

    return guardedMatch(text, pattern)
}

function checkHttp(text:string):string{
    let pattern = /(http(s)?:\/\/.).*/g
    if(guardedMatch(text, pattern)){
        return text;
    }
    return 'http://'+text;
}

function guardedMatch(text:string, pattern:RegExp){
    if(text.match(pattern)){
        return (text.match(pattern)[0] == text)
    }
    return false;
}

var launch = new Launcher();

let tools = new Tools()
let resultList:string[] = []
let resultIndex:number = 0;

// Load or initialise launch
if(localStorage.getItem('launch')){
    // If launch is not succesfully loaded init it
    if(!launch.load(JSON.parse(localStorage.getItem('launch')))){
        launch.initLaunch()
        localStorage.setItem('launch', launch.store())
    }
} else {
    launch.initLaunch()
    localStorage.setItem('launch', launch.store())
}

let tree = new Tree(launch);
tools.hideTree(launch.getTreeHidden())

tools.showLaunch();

$(function(){
    
    tools.setBackground(launch.getBackground())

    // Clicking in console to focus
    tools.getTerminal().click(function(){
        tools.getConsole().focus();
    });

    // When typing in console
    tools.getConsole().on('keyup', function(key){
        // Listen for enter
        let launchVal:string = tools.getLaunchBoxValue()
        switch(key.key){
            case 'Enter':
                // Check if using a command
                if(launch.getCommands().includes(launchVal.split(' ')[0])){
                    let returnStatement:string = launch.execCommand(launchVal)
                    tools.clearLaunchBox();
                    localStorage.setItem('launch', launch.store())

                    tree.updateTree(launch)
                    
                    tools.setBackground(launch.getBackground())
                    tools.hideTree(launch.getTreeHidden())
                    
                    tools.addHistory(returnStatement)
                } else {
                    // First, check if url before anything else. least taxing
                    // Second, send the currently selected link item
                    // Third, if running a query/standard search 
                    // (technically the same)
                    if(isUrl(launchVal)){
                        window.location.href = checkHttp(launchVal);
                    } else if(resultList.length != 0){
                        launch.runFile(resultList[resultIndex])
                    } else {
                        launch.runFile(launchVal);
                    }
                }
                break;
            case 'ArrowUp':
                tools.setText(launch.getHistory(true))
                break;
            case 'ArrowDown':
                tools.setText(launch.getHistory(false))                
                break;
            default:
                // search for links
                if(tools.getLaunchBoxValue()){
                    resultList = launch.search(launchVal);
                }
        }
    });

})