define(["require", "exports", "launch", "htmltools", "./tree"], function (require, exports, launch_1, htmltools_1, tree_1) {
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
    var launch = new launch_1.Launcher();
    let tools = new htmltools_1.Tools();
    let resultList = [];
    let resultIndex = 0;
    // Load or initialise launch
    if (localStorage.getItem('launch')) {
        // If launch is not succesfully loaded init it
        if (!launch.load(JSON.parse(localStorage.getItem('launch')))) {
            launch.initLaunch();
            localStorage.setItem('launch', launch.store());
        }
    }
    else {
        launch.initLaunch();
        localStorage.setItem('launch', launch.store());
    }
    let tree = new tree_1.Tree(launch);
    tools.hideTree(launch.getTreeHidden());
    tools.showLaunch();
    console.log(launch);
    $(function () {
        tools.setBackground(launch.getBackground());
        // Clicking in console to focus
        tools.getTerminal().click(function () {
            tools.getConsole().focus();
        });
        // When typing in console
        tools.getConsole().on('keyup', function (key) {
            // Listen for enter
            let launchVal = tools.getLaunchBoxValue();
            if (key.which == 13) {
                // Check if using a command
                if (launch.getCommands().includes(launchVal.split(' ')[0])) {
                    let returnStatement = launch.execCommand(launchVal);
                    tools.clearLaunchBox();
                    localStorage.setItem('launch', launch.store());
                    tree.updateTree(launch);
                    tools.setBackground(launch.getBackground());
                    tools.hideTree(launch.getTreeHidden());
                    tools.addHistory(returnStatement);
                }
                else {
                    // First, check if url before anything else. least taxing
                    // Second, send the currently selected link item
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
            }
            else {
                // search for links
                if (tools.getLaunchBoxValue()) {
                    resultList = launch.search(launchVal);
                }
            }
        });
    });
});
