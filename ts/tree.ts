import { Launcher } from "./launch";

import { LaunchFolder } from "./launchfolder";

import { LaunchFile } from "./launchfile";

import { LaunchLink } from "./launchlink";

export class Tree {
    private tree: JQuery;

    constructor(launch:Launcher){
        $('#tree-wrapper').html(`<div class='window' id='tree-window'>
                                <div class='window-content' id='tree-content'>
                                    <div id='tree'></div>
                                </div>
                            </div>`)
        this.tree = $('#tree');
        this.updateTree(launch)
    }

    updateTree(launch:Launcher){

        let folders:LaunchFolder[] = launch.getFolders()
                                     .sort((foldera, folderb) => 
                                     foldera.name > folderb.name ? 1 : -1);
        let files:LaunchFile[] = launch.getFiles()
        this.tree.html('')

        for(let i = 0; i < folders.length; i++){
            let folder = folders[i];
            
            // Create folder div element
            let folderDiv:HTMLElement = document.createElement('div');
            folderDiv.className = 'tree-base';
            folderDiv.id = `tree-folder-${folder.name}`

            let folderName:HTMLElement = document.createElement('span');
            folderName.className = 'tree-folder-name';
            folderName.append(folder.name);
            folderDiv.append(folderName);

            // Get files that belong to this folder
            let folderFiles = files.filter(file => file.parentId == folder.id)
                                   .sort((filea, fileb) => 
                                   filea.filename > fileb.filename ? 1 : -1);
            let filesDiv:HTMLElement = document.createElement('div');
            filesDiv.className = 'tree-files';

            if(folderFiles.length > 0){
                // Go through all files in folder and ad to div
                for(let k = 0; k < folderFiles.length; k++){
                let file = folderFiles[k];

                let fileDiv:HTMLElement = document.createElement('div');
                fileDiv.className = 'tree-file'
                fileDiv.id = `tree-file-${file.filename}`

                let fileName:HTMLElement;

                if(file instanceof LaunchLink){
                    fileName = document.createElement('a');
                    fileName.setAttribute('href', file.content)
                } else {
                    fileName = document.createElement('span');
                }
                
                fileName.className = 'tree-file-name';
                fileName.append(file.filename)

                fileDiv.append(fileName)
                
                filesDiv.append(fileDiv)
                }
                
                // Add this fodlers files div to it
                folderDiv.append(filesDiv)
            }

            this.tree.append(folderDiv);
        }

        // Files that do not belong in a folder
        let orphanedFiles = files
                            .filter(file => file.parentId == undefined)
                            .sort((filea, fileb) => 
                                   filea.filename > fileb.filename ? 1 : -1);
        for(let i = 0; i < orphanedFiles.length; i++){
            let file = orphanedFiles[i];
            // Create folder div element
            let orphanDiv:HTMLElement = document.createElement('div');
            orphanDiv.className = 'tree-base';
            orphanDiv.id = `tree-file-${file.filename}`

            let fileName:HTMLElement;

            if(file instanceof LaunchLink){
                fileName = document.createElement('a');
                fileName.setAttribute('href', file.content)
            } else {
                fileName = document.createElement('span');
            }
            fileName.append(file.filename)
            orphanDiv.append(fileName);

            this.tree.append(orphanDiv);
        }
    }
}