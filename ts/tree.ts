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
        this.updateTree(launch, -1);
    }

    updateTree(launch:Launcher, folderID:number){

        let folders:LaunchFolder[] = launch.getFolders()
                                     .sort((foldera, folderb) => 
                                     foldera.name > folderb.name ? 1 : -1);
        
        let files:LaunchFile[] = launch.getFiles();
        this.tree.html('');

        for(let i = 0; i < folders.length; i++){
            let folder = folders[i];
            
            // Create folder div element
            let folderDiv: HTMLElement = this.createFolderElement(folder);

            // If current folder is selected, need to display files
            if (folderID == folder['id']) {
                // Get files that belong to this folder
                let folderFiles = files.filter(file => file.parentId == folder.id)
                .sort((filea, fileb) => 
                filea.filename > fileb.filename ? 1 : -1);

                // Create div to contain tree files
                let filesDiv:HTMLElement = document.createElement('div');
                filesDiv.className = 'tree-files';

                // Add files to the file div
                if(folderFiles.length > 0){
                    for(let k = 0; k < folderFiles.length; k++){
                        let file = folderFiles[k];

                        let fileDiv: HTMLElement = this.createFileDiv(file, folder);

                        filesDiv.append(fileDiv);
                    }
                }
                // Append files to the folder, then folder to tree
                folderDiv.append(filesDiv);
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
            
            let orphanDiv: HTMLElement = this.createFileDiv(file);

            this.tree.append(orphanDiv);
        }
    }

    private createFileDiv(file: LaunchFile, selectedFolder?: LaunchFolder) {
        let fileDiv: HTMLElement = document.createElement('div');

        if(selectedFolder){
            fileDiv.className = 'tree-file';
        } else {
            fileDiv.className = 'tree-base';
        }
        fileDiv.id = `tree-file-${file.filename}`;

        let fileName: HTMLElement;
        fileName = document.createElement('a');

        if (file instanceof LaunchLink) {
            fileName.setAttribute('href', file.content);
        } else {
            fileName.setAttribute('href', '#');
            if(selectedFolder){
                fileName.setAttribute('folder', selectedFolder.name);
            }
            fileName.className = 'query ';
        }

        fileName.className += 'tree-file-name';
        // add filename to a tag
        fileName.append(file.filename);

        // append file div to container
        fileDiv.append(fileName);
        return fileDiv;
    }

    private createFolderElement(folder: LaunchFolder) {
        let folderDiv: HTMLElement = document.createElement('div');
        folderDiv.className = 'tree-base';
        folderDiv.id = `${folder.name}`;

        let folderName: HTMLElement = document.createElement('span');
        folderName.className = 'tree-folder-name';
        folderName.append(folder.name);
        folderDiv.append(folderName);
        return folderDiv;
    }
}