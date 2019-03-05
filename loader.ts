import { Launcher } from "launch"


var launch = new Launcher();

$(function(){
    launch.mkdir(['test']);
    launch.touch('launch/google.lnk', 'https://www.google.com');
    launch.touch('launch/google.qry', 'g: https://www.google.com/search?q=${}');
    launch.touch('launch/bing.qry', 'b: https://www.bing.com/search?q=${}');

    let launchBox:JQuery = $('#console');
    let resultList:string[] = []
    let resultIndex:number = 0;
    let querySearching:boolean = false;

    console.log(launch)

    launchBox.on('keyup', function(key){
        // Listen for enter
        if(key.which == 13){
            if(querySearching || resultList.length == 0){
                launch.run(String(launchBox.val()));
            } else {
                launch.run(resultList[resultIndex])
            }
        } else {
            // search for links
            if(launchBox.val()){
                querySearching = launch.isQuerySearch(String(launchBox.val()))
                resultList = launch.search(String(launchBox.val()));
            }
        }
    });

})