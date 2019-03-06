import { Launcher } from "launch"

function isUrl(text:string):boolean{
    let pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

    if(text.match(pattern)){
        if(text.match(pattern)[0] == text) {
            console.log('true');
            return true;
        }
    }
    return false;
}

function checkHttp(text:string):string{
    let pattern = /(http(s)?:\/\/.)*/g
    if(text.match(pattern)[0] == text) {
        return text;
    }
    return 'http://'+text;
}

function initLaunch(l:Launcher){
    l.mkdir(['stack', 'media']);
    l.touch('launch/google.lnk', 'https://www.google.com');
    l.touch('launch/google.qry', 'g: https://www.google.com/search?q=${}');
    l.touch('launch/bing.qry', 'b: https://www.bing.com/search?q=${}');
    l.touch('stack/jsregex.lnk', 
    'https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url');
    l.touch('media/youtube.lnk', 'https://youtube.com/feed/subscriptions');
    return l;
}

var launch = new Launcher();

$(function(){
    if(localStorage.getItem('launch')){
        launch.load(JSON.parse(localStorage.getItem('launch')))
    } else {
        launch = initLaunch(launch);
    }

    let launchBox:JQuery = $('#console');
    launchBox.val('');
    let resultList:string[] = []
    let resultIndex:number = 0;
    let querySearching:boolean = false;

    launchBox.on('keyup', function(key){
        // Listen for enter
        let launchVal:string = String(launchBox.val());
        if(key.which == 13){

            if(launch.getCommands().includes(launchVal.split(' ')[0])){
                launch.execCommand(launchVal)

                launchBox.val('');

                localStorage.setItem('launch', launch.store())
                // launch.store()

            } else {
                // First, check if url before anything else. least taxing
                // Second, send the currently selected link item
                // Third, if running a query/standard search (technically the same)
                if(isUrl(launchVal)){
                    window.location.href = checkHttp(launchVal);          
                } else if(resultList.length != 0){
                    launch.run(resultList[resultIndex])
                } else {
                    launch.run(launchVal);
                }
            }
        } else {
            // search for links
            if(launchBox.val()){
                querySearching = launch.isQuerySearch(launchVal)
                resultList = launch.search(launchVal);
            }
        }
    });

})