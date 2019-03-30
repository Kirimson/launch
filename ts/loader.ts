import { Launcher } from "launch"
import {Tools} from "htmltools"
import { Tree } from "./tree";
import { LaunchQuery } from "./launchquery";
import { LaunchFile } from "./launchfile";
import { LaunchLink } from "./launchlink";

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

function startPageImport(){
    launch.initLaunch();
    let startJson:JSON = JSON.parse(localStorage.getItem('personal-links'));

    for(let index = 0; index < startJson['titles'].length; index++){
        let title:string = startJson['titles'][index]
        title.replace(' ', '_');
        title = title.toLowerCase();

        launch.mkdir([title])

        startJson['links'][index].forEach(link => {
            let linkName = link[0].replace(' ', '_');
            linkName = linkName.toLowerCase();
            launch.touch(`${title}/${linkName}.lnk`, link[1]);
            tree.updateTree(launch)
        });
        tree.updateTree(launch)
    }
    tools.clearLaunchBox();
    localStorage.setItem('launch', launch.store())
    tree.updateTree(launch)
}

function rebuildLaunch(){
    tools.addHistory('Launch is corrupted, rebuilding...')
    launch.initLaunch()
    localStorage.setItem('launch', launch.store())
}

function getSimilar(value: string, fuzzy:boolean=true): string {

    // let search = value;
    // if(value.includes(' ')){
    let compositeValue:string[] = value.split(' ');
    let search = compositeValue[compositeValue.length-1];
    // }
    // check if simialar to a folder or not
    if(search.includes('/')){
        // Check aginst file
        let split = search.split('/'),
            folder = split[0],
            fileName = split[1];
        if(fileName){
            let fileLinks = launch.getFiles().filter(file => file instanceof LaunchLink);
            fileLinks = fileLinks.filter(file => file.parentName == folder);

            return fuzzyFindFile(fileLinks, compositeValue, fileName)
        }
    }

    // Check against folder
    let folders = launch.getFolders();
    for(let i = 0; i < folders.length; i++){
        let folder = folders[i];
        if(folder.name.startsWith(search)){
            compositeValue[compositeValue.length-1] = `${folder.name}/`;
            return compositeValue.join(' ');
        }
    }

    // Or... Files that are in root
    let fileLinks = launch.getFiles().filter(file => file instanceof LaunchLink);
    fileLinks = fileLinks.filter(file => !file.parentName);

    let found = fuzzyFindFile(fileLinks, compositeValue, search)
    if(found){
        return found;
    }
    
    if(fuzzy){
        let fullAutocomplete = launch.search(search)[0];
        if(fullAutocomplete){
            compositeValue[compositeValue.length-1] = fullAutocomplete;
            return compositeValue.join(' ');
        }
    }
    
    return value;
}

function fuzzyFindFile(fileLinks:LaunchFile[], compositeValue:string[], search:string){
    for(let i = 0; i < fileLinks.length; i++){
        let file = fileLinks[i];
        if(file.filename.startsWith(search)){
            compositeValue[compositeValue.length-1] = file.getLocation();
            return compositeValue.join(' ');
        }
    }
    return '';
}

var launch = new Launcher();

let tools = new Tools();
let resultList:string[] = [];
let resultIndex:number = 0;

// Load or initialise launch
if(localStorage.getItem('launch')){
    // If launch is not succesfully loaded init it
    let launchData:JSON
    try{
        launchData = JSON.parse(localStorage.getItem('launch'));
        if(!launch.load(launchData)){
            rebuildLaunch();
        }
    } catch {
        rebuildLaunch();
    }
} else {
    launch.initLaunch();
    localStorage.setItem('launch', launch.store());
}

let tree = new Tree(launch);
tools.hideTree(launch.getTreeHidden());

tools.setBackground(launch.getBackground());
tools.setWindowColor(launch.getColor());
tools.showLaunch();

$(function(){
    
    // Clicking in console to focus
    tools.getTerminal().click(function(){
        tools.getConsole().focus();
    });

    // Prevent default for up/down
    tools.getConsole().on('keydown', function(key){
        switch(key.key){
            case 'ArrowUp':
                key.preventDefault();
                break;
            case 'ArrowDown':
                key.preventDefault();
                break;
            case 'Tab':
                key.preventDefault();
                let autocomplete = getSimilar(tools.getConsoleVal());
                tools.setConsoleText(autocomplete);
        }
    })

    // When typing in console
    tools.getConsole().on('keyup', function(key){
        // Listen for enter
        let launchVal:string = tools.getConsoleVal();

        switch(key.key){
            case 'Enter':
                // import
                if(launchVal == '!importfromstartpage'){
                    startPageImport();
                    break;
                }

                // Debug
                if(launchVal == '!!DEBUG!!'){
                    console.log(launch);
                    tools.clearLaunchBox();
                    break;
                }

                // Check if using a command
                if(launch.getCommands().includes(launchVal.split(' ')[0])){
                    let returnStatement:string = launch.execCommand(launchVal)
                    tools.clearLaunchBox();
                    localStorage.setItem('launch', launch.store());

                    tree.updateTree(launch);
                    
                    tools.setBackground(launch.getBackground());
                    tools.setWindowColor(launch.getColor());
                    tools.hideTree(launch.getTreeHidden());
                    
                    tools.addHistory(returnStatement)
                } else {
                    // First, check if url before anything else. least taxing
                    // Second, send the currently selected link from search
                    // Third, if running a query/standard search 
                    // (technically the same)
                    if(isUrl(launchVal)){
                        window.location.href = checkHttp(launchVal);
                    } else if(resultList.length != 0){
                        launch.runFile(resultList[resultIndex]);
                    } else {
                        launch.runFile(launchVal);
                    }
                }
                break;
            case 'ArrowUp':
                tools.setConsoleText(launch.getHistory(true));
                break;
            case 'ArrowDown':
                tools.setConsoleText(launch.getHistory(false));
                break;
            default:
                // When normally typing search for links from launch
                if(launchVal){
                    resultList = launch.search(launchVal);
                    if(launchVal.endsWith('/') == false){
                        let suggestion = getSimilar(launchVal, false);
                        if(suggestion != launchVal){
                            tools.setSuggestion(suggestion)
                        }
                    } else {
                        tools.setSuggestion('')
                    }
                } else {
                    tools.setSuggestion('')
                }
            }
    });

    $('#tree').on('click','.query',function() {

        let fileName = this.innerHTML;
        let folderName = this.getAttribute('folder');
    
        let fileLocation = `${folderName}/${fileName}`;
    
        let queryFile:LaunchFile = launch.getFile(fileLocation);
        if(queryFile instanceof LaunchQuery){
            tools.getConsole().val(queryFile.shortHand);
            tools.getConsole().focus();
        }
    });
    
})