define(["require", "exports", "launch"], function (require, exports, launch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var launch = new launch_1.Launcher();
    $(function () {
        launch.mkdir(['test']);
        launch.touch('launch/google.lnk', 'https://www.google.com');
        launch.touch('launch/google.qry', 'g: https://www.google.com/search?q=${}');
        launch.touch('launch/bing.qry', 'b: https://www.bing.com/search?q=${}');
        let launchBox = $('#console');
        let resultList = [];
        let resultIndex = 0;
        let querySearching = false;
        console.log(launch);
        launchBox.on('keyup', function (key) {
            // Listen for enter
            if (key.which == 13) {
                if (querySearching || resultList.length == 0) {
                    launch.run(String(launchBox.val()));
                }
                else {
                    launch.run(resultList[resultIndex]);
                }
            }
            else {
                // search for links
                if (launchBox.val()) {
                    querySearching = launch.isQuerySearch(String(launchBox.val()));
                    resultList = launch.search(String(launchBox.val()));
                }
            }
        });
    });
});
