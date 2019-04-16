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

    let compositeValue:string[] = value.split(' ');
    let search = compositeValue[compositeValue.length-1];
    // check if simialar to a folder or not
    if(search.includes('/')){
        // Check aginst file
        let split = search.split('/'),
            folder = split[0],
            fileName = split[1];
        if(fileName){
            let fileLinks = launch.getFiles().filter(file => file instanceof LaunchLink);
            fileLinks = fileLinks.filter(file => file.parentName == folder);

            let found = fuzzyFindFile(fileLinks, compositeValue, fileName)
            if(found){
                return found;
            }
        }
    }

    // Check against folder
    let folders = launch.getFolders();
    for(let i = 0; i < folders.length; i++){
        let folder = folders[i];
        let folderName:String = folder.name
        if(folderName.startsWith(search)){
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
        let fileName:String = file.filename
        if(fileName.startsWith(search)){
            compositeValue[compositeValue.length-1] = file.getLocation();
            return compositeValue.join(' ');
        }
    }
    return '';
}

function highlightFzfIndex(offset:number){
    $(`#fzf-${fzfIndex}`).removeClass('fzf-selected')
    fzfIndex += offset;
    $(`#fzf-${fzfIndex}`).addClass('fzf-selected')
}

var launch = new Launcher();

let tools = new Tools();
let resultList:string[] = [];
let resultIndex:number = 0;

let fzfList:string[] = [];
let fzfIndex = -1;
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
                let launchCommand = launchVal.split(' ')[0];
                if(launch.getCommands().includes(launchCommand)){
                    let returnStatement:string = launch.execCommand(launchVal)
                    tools.clearLaunchBox();
                    localStorage.setItem('launch', launch.store());

                    tree.updateTree(launch);
                    
                    tools.setBackground(launch.getBackground());
                    tools.setWindowColor(launch.getColor());
                    tools.hideTree(launch.getTreeHidden());
                    
                    tools.addHistory(returnStatement)
                } else {
                    // Check if fzf is used and has a link selected
                    if(fzfList.length > 0 && fzfIndex != -1){
                        launch.runFile(fzfList[fzfIndex])
                    // check if url before anything else. least taxing
                    } else if(isUrl(launchVal)){
                        window.location.href = checkHttp(launchVal);
                        // send the currently selected link from search
                    } else if(resultList.length != 0){
                        launch.runFile(resultList[resultIndex]);
                    // check if running a query/standard search 
                    } else {
                        launch.runFile(launchVal);
                    }
                }
                break;
            case 'ArrowUp':
                if(fzfList.length == 0){
                    tools.setConsoleText(launch.getHistory(true));
                } else if(fzfIndex < fzfList.length-1) {
                    // fzfIndex++;
                    highlightFzfIndex(1)
                }
                break;
            case 'ArrowDown':
                if(fzfList.length == 0){
                    tools.setConsoleText(launch.getHistory(false));
                } else if(fzfIndex > 0) {
                    // fzfIndex--;
                    highlightFzfIndex(-1)
                }
                break;
            default:
                // When normally typing search for links from launch
                let suggestionSet:boolean = false;
                if(launchVal && !launch.isQuerySearch(launchVal)){
                    resultList = launch.search(launchVal);
                    if(launchVal.endsWith('/') == false &&
                        launchVal.endsWith(' ') == false){
                        let suggestion = getSimilar(launchVal, false);
                        if(suggestion != launchVal){
                            tools.setSuggestion(suggestion)
                            suggestionSet = true;
                        }
                    }
                } else {
                    resultList = [];
                    resultIndex = 0;
                }
                if(!suggestionSet){
                    tools.setSuggestion('')
                }
                // fzf stuff
                if(launch.isfzf()){
                    let hideFzf:boolean = true;
                    // If launch has a value
                    if(launchVal){
                        // If there is stuff to find
                        fzfList = launch.search(launchVal).slice(0,25)
                        if(fzfList.length > 0){
                            fzfIndex = 0;
                            tools.populateFzf(fzfList);
                            tools.hideConsoleHistory(true);
                            tools.hideFzf(false);
                            hideFzf = false;
                            highlightFzfIndex(0);
                        }
                    } 
                    if(hideFzf) {
                        fzfList = [];
                        fzfIndex = -1;
                        tools.hideFzf(true)
                        tools.hideConsoleHistory(false)
                    }
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

    $('#fzf').on('click', '.fzf', function(){
        launch.runFile(String(this.innerHTML.trim()))
    })
    
})