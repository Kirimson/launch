define(["require", "exports", "launch", "htmltools"], function (require, exports, launch_1, htmltools_1) {
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
    function initLaunch(l) {
        l.mkdir(['launch']);
        l.touch('launch/google.lnk', 'https://www.google.com');
        l.touch('launch/google.qry', 'g: https://www.google.com/search?q=${}');
        l.touch('launch/bing.qry', 'b: https://www.bing.com/search?q=${}');
        l.setReadOnly('launch');
        localStorage.setItem('launch', launch.store());
        return l;
    }
    var launch = new launch_1.Launcher();
    let tools = new htmltools_1.Tools();
    let resultList = [];
    let resultIndex = 0;
    $(function () {
        // Load or initialise launch
        if (localStorage.getItem('launch')) {
            // If launch is not succesfully loaded init it
            if (!launch.load(JSON.parse(localStorage.getItem('launch')))) {
                launch = initLaunch(launch);
            }
        }
        else {
            launch = initLaunch(launch);
        }
        tools.updateTree(launch);
        tools.setBackground(launch.getBackground());
        tools.getLaunchBox().on('keyup', function (key) {
            // Listen for enter
            let launchVal = tools.getLaunchBoxValue();
            if (key.which == 13) {
                if (launch.getCommands().includes(launchVal.split(' ')[0])) {
                    launch.execCommand(launchVal);
                    tools.clearLaunchBox();
                    localStorage.setItem('launch', launch.store());
                    tools.updateTree(launch);
                    tools.setBackground(launch.getBackground());
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
