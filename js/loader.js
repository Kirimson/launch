define(["require", "exports", "launch", "htmltools", "./tree", "./launchquery", "./launchlink"], function (require, exports, launch_1, htmltools_1, tree_1, launchquery_1, launchlink_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isUrl(text) {
        let pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
        return guardedMatch(text, pattern);
    }
    function checkHttp(text) {
        let pattern = /(http(s)?:\/\/.).*/g;
        if (guardedMatch(text, pattern)) {
            return text;
        }
        return 'http://' + text;
    }
    function guardedMatch(text, pattern) {
        if (text.match(pattern)) {
            return (text.match(pattern)[0] == text);
        }
        return false;
    }
    function rebuildLaunch() {
        tools.addHistory('Launch is corrupted, rebuilding...');
        launch.initLaunch();
        launch.store();
    }
    function getSimilar(value, fuzzy = true) {
        let compositeValue = value.split(' ');
        let search = compositeValue[compositeValue.length - 1];
        // check if simialar to a folder or not
        if (search.includes('/')) {
            // Check aginst file
            let split = search.split('/'), folder = split[0], fileName = split[1];
            if (fileName) {
                let fileLinks = launch.getFiles().filter(file => file instanceof launchlink_1.LaunchLink);
                fileLinks = fileLinks.filter(file => file.parentName == folder);
                let found = fuzzyFindFile(fileLinks, compositeValue, fileName);
                if (found) {
                    return found;
                }
            }
        }
        // Check against folder
        let folders = launch.getFolders();
        for (let i = 0; i < folders.length; i++) {
            let folder = folders[i];
            let folderName = folder.name;
            if (folderName.startsWith(search)) {
                compositeValue[compositeValue.length - 1] = `${folder.name}/`;
                return compositeValue.join(' ');
            }
        }
        // Or... Files that are in root
        let fileLinks = launch.getFiles().filter(file => file instanceof launchlink_1.LaunchLink);
        fileLinks = fileLinks.filter(file => !file.parentName);
        let found = fuzzyFindFile(fileLinks, compositeValue, search);
        if (found) {
            return found;
        }
        if (fuzzy) {
            let fullAutocomplete = launch.search(search)[0];
            if (fullAutocomplete) {
                compositeValue[compositeValue.length - 1] = fullAutocomplete;
                return compositeValue.join(' ');
            }
        }
        return value;
    }
    function fuzzyFindFile(fileLinks, compositeValue, search) {
        for (let i = 0; i < fileLinks.length; i++) {
            let file = fileLinks[i];
            let fileName = file.filename;
            if (fileName.startsWith(search)) {
                compositeValue[compositeValue.length - 1] = file.getLocation();
                return compositeValue.join(' ');
            }
        }
        return '';
    }
    function moveFuzzyIndex(offset) {
        $(`#fuzzy-${fuzzyIndex}`).removeClass('fuzzy-selected');
        fuzzyIndex += offset;
        $(`#fuzzy-${fuzzyIndex}`).addClass('fuzzy-selected');
    }
    var launch = new launch_1.Launcher();
    let tools = new htmltools_1.Tools();
    let resultList = [];
    let resultIndex = 0;
    let fuzzyList = [];
    let fuzzyIndex = -1;
    // Currently viewed folder
    let currentFolder = -1;
    // Load or initialise launch
    if (localStorage.getItem('launch')) {
        // try{
        let launch_base = JSON.parse(localStorage.getItem('launch'));
        let launch_folders;
        let launch_files;
        if (localStorage.getItem('launch_folders') != null) {
            launch_folders = JSON.parse(localStorage.getItem('launch_folders'));
        }
        if (localStorage.getItem('launch_files') != null) {
            launch_files = JSON.parse(localStorage.getItem('launch_files'));
        }
        if (!launch.load(launch_base, launch_folders, launch_files)) {
            console.log("Couldnt load");
            rebuildLaunch();
        }
        // } catch {
        //     rebuildLaunch();
        // }
    }
    else {
        launch.initLaunch();
        launch.store();
    }
    // Start loading things in
    // Hide tree if hidden
    let tree = new tree_1.Tree(launch);
    tools.hideTree(launch.getTreeHidden());
    // Hide privacy link if hidden
    tools.hideElement(!launch.getPrivacy(), $('#privacy'));
    // Set bg image
    tools.setBackground(launch.getBackground());
    // Set color
    tools.setWindowColor(launch.getColor());
    // Display launch after all loading is done
    tools.showLaunch();
    $(function () {
        // Clicking in console to focus
        tools.getTerminal().click(function () {
            tools.getConsole().focus();
        });
        // Prevent default for up/down
        tools.getConsole().on('keydown', function (key) {
            switch (key.key) {
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
        });
        // When typing in console
        tools.getConsole().on('keyup', function (key) {
            // Listen for enter
            let launchVal = tools.getConsoleVal();
            switch (key.key) {
                case 'Enter':
                    // Debug
                    if (launchVal == '!!DEBUG!!') {
                        console.log(launch);
                        tools.clearLaunchBox();
                        break;
                    }
                    // Check if using a command
                    let launchCommand = launchVal.split(' ')[0];
                    if (launch.getCommands().includes(launchCommand)) {
                        let returnStatement = launch.execCommand(launchVal);
                        tools.clearLaunchBox();
                        launch.store();
                        // Update Launch after a command
                        tree.updateTree(launch, currentFolder);
                        tools.setBackground(launch.getBackground());
                        tools.setWindowColor(launch.getColor());
                        tools.hideTree(launch.getTreeHidden());
                        tools.hideElement(!launch.getPrivacy(), $('#privacy'));
                        // Add command to history
                        tools.addHistory(returnStatement);
                    }
                    else {
                        // Check if fuzzy list is used and has a link selected
                        if (fuzzyList.length > 0 && fuzzyIndex != -1) {
                            launch.runFile(fuzzyList[fuzzyIndex]);
                            // check if url before anything else. least taxing
                        }
                        else if (isUrl(launchVal)) {
                            window.location.href = checkHttp(launchVal);
                            // send the currently selected link from search
                        }
                        else if (resultList.length != 0) {
                            launch.runFile(resultList[resultIndex]);
                            // check if running a query/standard search 
                        }
                        else {
                            launch.runFile(launchVal);
                        }
                    }
                    // Clear the suggestion if there was one hanging from command
                    tools.setSuggestion('');
                    break;
                case 'ArrowUp':
                    if (fuzzyList.length == 0) {
                        tools.setConsoleText(launch.getHistory(true));
                    }
                    else if (fuzzyIndex < fuzzyList.length - 1) {
                        moveFuzzyIndex(1);
                    }
                    break;
                case 'ArrowDown':
                    if (fuzzyList.length == 0) {
                        tools.setConsoleText(launch.getHistory(false));
                    }
                    else if (fuzzyIndex > 0) {
                        moveFuzzyIndex(-1);
                    }
                    break;
                default:
                    // When typing search for links from launch
                    let suggestionSet = false;
                    // Check if console has text, and that entered text
                    // is not an existing query prefix
                    if (launchVal && !launch.isQuerySearch(launchVal)) {
                        resultList = launch.search(launchVal);
                        if (launchVal.endsWith('/') == false &&
                            launchVal.endsWith(' ') == false) {
                            let suggestion = getSimilar(launchVal, false);
                            if (suggestion != launchVal) {
                                tools.setSuggestion(suggestion);
                                suggestionSet = true;
                            }
                        }
                    }
                    else {
                        resultList = [];
                        resultIndex = 0;
                    }
                    if (!suggestionSet) {
                        tools.setSuggestion('');
                    }
                    if (launch.isFuzzyFinderOn()) {
                        let hideFuzzyFinder = true;
                        // If launch has a value
                        if (launchVal) {
                            // If there is stuff to find
                            fuzzyList = launch.search(launchVal).slice(0, 25);
                            if (fuzzyList.length > 0) {
                                fuzzyIndex = 0;
                                tools.populateFuzzyList(fuzzyList);
                                tools.hideConsoleHistory(true);
                                tools.hideFuzzyList(false);
                                hideFuzzyFinder = false;
                                moveFuzzyIndex(0);
                            }
                        }
                        if (hideFuzzyFinder) {
                            fuzzyList = [];
                            fuzzyIndex = -1;
                            tools.hideFuzzyList(true);
                            tools.hideConsoleHistory(false);
                        }
                    }
            }
        });
        $('#tree').on('click', '.query', function () {
            let fileName = this.innerHTML;
            let folderName = this.getAttribute('folder');
            let fileLocation = `${folderName}/${fileName}`;
            let queryFile = launch.getFile(fileLocation);
            if (queryFile instanceof launchquery_1.LaunchQuery) {
                tools.getConsole().val(queryFile.shortHand);
                tools.getConsole().focus();
            }
        });
        $('#tree').on('click', '.tree-folder-name', function () {
            let folderName = this.innerHTML;
            let clickedFolder = launch.getFolder(folderName);
            if (currentFolder == clickedFolder['id']) {
                currentFolder = -1;
            }
            else {
                currentFolder = clickedFolder['id'];
            }
            tree.updateTree(launch, currentFolder);
        });
        $('#fuzzy-list').on('click', '.fuzzy', function () {
            launch.runFile(String(this.innerHTML.trim()));
        });
        $('.link').on('click', function () {
            let filename = this.innerHTML;
            console.log(filename);
            launch.runFile(filename);
            return false;
        });
    });
});
