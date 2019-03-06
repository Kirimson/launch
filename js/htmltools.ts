import { Launcher, LaunchFolder, LaunchFile } from "./launch";
import "loader"

export class Tools {

    private treeBox:JQuery;
    private launchBox:JQuery;

    constructor(){
        this.launchBox = $('#console');
        this.treeBox = $('#tree');
    }

    getLaunchBox():JQuery{
        return this.launchBox;
    }

    getLaunchBoxValue():string{
        return String(this.launchBox.val());
    }

    clearLaunchBox():void{
        this.launchBox.val('');
    }

    setTreeHtml(launch:Launcher){

        let folders:LaunchFolder[] = launch.getFolders()
        let files:LaunchFile[] = launch.getFiles()
        this.treeBox.html('')

        for(let i = 0; i < folders.length; i++){
            let folder = folders[i];
            
            // Create folder div element
            let folderDiv:HTMLElement = document.createElement('div');
            folderDiv.className = 'tree-folder';
            folderDiv.id = folder.name+'-folder';

            let foldername:HTMLElement = document.createElement('span');
            foldername.className = 'tree-folder-name';

            foldername.append(folder.name);
            folderDiv.append(foldername);

            let folderFiles = files.filter(x => x.parentId == folder.id);
            let fileDiv:HTMLElement = document.createElement('div');


            this.treeBox.append(folderDiv);
        }
    }
}