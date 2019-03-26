define(["require", "exports", "launch", "htmltools", "./tree", "./launchquery"], function (require, exports, launch_1, htmltools_1, tree_1, launchquery_1) {
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
    function startPageImport() {
        launch.initLaunch();
        let startJson = JSON.parse(localStorage.getItem('personal-links'));
        for (let index = 0; index < startJson['titles'].length; index++) {
            let title = startJson['titles'][index];
            title.replace(' ', '_');
            title = title.toLowerCase();
            launch.mkdir([title]);
            startJson['links'][index].forEach(link => {
                let linkName = link[0].replace(' ', '_');
                linkName = linkName.toLowerCase();
                launch.touch(`${title}/${linkName}.lnk`, link[1]);
                tree.updateTree(launch);
            });
            tree.updateTree(launch);
        }
        tools.clearLaunchBox();
        localStorage.setItem('launch', launch.store());
        tree.updateTree(launch);
    }
    function rebuildLaunch() {
        tools.addHistory('Launch is corrupted, rebuilding...');
        launch.initLaunch();
        localStorage.setItem('launch', launch.store());
    }
    var launch = new launch_1.Launcher();
    let tools = new htmltools_1.Tools();
    let resultList = [];
    let resultIndex = 0;
    // Load or initialise launch
    if (localStorage.getItem('launch')) {
        // If launch is not succesfully loaded init it
        let launchData;
        try {
            launchData = JSON.parse(localStorage.getItem('launch'));
            if (!launch.load(launchData)) {
                rebuildLaunch();
            }
        }
        catch (_a) {
            rebuildLaunch();
        }
    }
    else {
        launch.initLaunch();
        localStorage.setItem('launch', launch.store());
    }
    let tree = new tree_1.Tree(launch);
    tools.hideTree(launch.getTreeHidden());
    tools.setBackground(launch.getBackground());
    tools.setWindowColor(launch.getColor());
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
                    let autocomplete = launch.getSimilar(tools.getConsoleVal());
                    tools.setConsoleText(autocomplete);
            }
        });
        // When typing in console
        tools.getConsole().on('keyup', function (key) {
            // Listen for enter
            let launchVal = tools.getConsoleVal();
            switch (key.key) {
                case 'Enter':
                    // import
                    if (launchVal == '!importfromstartpage') {
                        startPageImport();
                        break;
                    }
                    // Debug
                    if (launchVal == '!!DEBUG!!') {
                        console.log(launch);
                        tools.clearLaunchBox();
                        break;
                    }
                    // Check if using a command
                    if (launch.getCommands().includes(launchVal.split(' ')[0])) {
                        let returnStatement = launch.execCommand(launchVal);
                        tools.clearLaunchBox();
                        localStorage.setItem('launch', launch.store());
                        tree.updateTree(launch);
                        tools.setBackground(launch.getBackground());
                        tools.setWindowColor(launch.getColor());
                        tools.hideTree(launch.getTreeHidden());
                        tools.addHistory(returnStatement);
                    }
                    else {
                        // First, check if url before anything else. least taxing
                        // Second, send the currently selected link from search
                        // Third, if running a query/standard search 
                        // (technically the same)
                        if (isUrl(launchVal)) {
                            window.location.href = checkHttp(launchVal);
                        }
                        else if (resultList.length != 0) {
                            launch.runFile(resultList[resultIndex]);
                        }
                        else {
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
                    if (launchVal) {
                        resultList = launch.search(launchVal);
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
    });
});
