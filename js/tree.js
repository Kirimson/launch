define(["require", "exports", "./launchlink"], function (require, exports, launchlink_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tree = void 0;
    class Tree {
        constructor(launch) {
            $('#tree-wrapper').html(`<div class='window' id='tree-window'>
                                <div class='window-content' id='tree-content'>
                                    <div id='tree'></div>
                                </div>
                            </div>`);
            this.tree = $('#tree');
            this.updateTree(launch, -1);
        }
        updateTree(launch, folderID) {
            let folders = launch.getFolders()
                .sort((foldera, folderb) => foldera.name > folderb.name ? 1 : -1);
            let files = launch.getFiles();
            this.tree.html('');
            // If at the root folder show folders
            if (folderID == -1) {
                for (let i = 0; i < folders.length; i++) {
                    let folder = folders[i];
                    // Create folder div element
                    let folderDiv = this.createFolderElement(folder);
                    this.tree.append(folderDiv);
                }
                // Files that do not belong in a folder
                let orphanedFiles = files
                    .filter(file => file.parentId == undefined)
                    .sort((filea, fileb) => filea.filename > fileb.filename ? 1 : -1);
                for (let i = 0; i < orphanedFiles.length; i++) {
                    let file = orphanedFiles[i];
                    // Create folder div element
                    let orphanDiv = document.createElement('div');
                    orphanDiv.className = 'tree-base';
                    orphanDiv.id = `tree-file-${file.filename}`;
                    let fileName;
                    if (file instanceof launchlink_1.LaunchLink) {
                        fileName = document.createElement('a');
                        fileName.setAttribute('href', file.content);
                    }
                    else {
                        fileName = document.createElement('span');
                    }
                    fileName.append(file.filename);
                    orphanDiv.append(fileName);
                    this.tree.append(orphanDiv);
                }
            }
            else {
                // Selected a folder, need to display files
                // Find selected folder
                let selectedFolder;
                for (let i = 0; i < folders.length; i++) {
                    let folder = folders[i];
                    if (folder['id'] == folderID) {
                        selectedFolder = folder;
                    }
                }
                // Add the folder
                let folderDiv = this.createFolderElement(selectedFolder);
                // Get files that belong to this folder
                let folderFiles = files.filter(file => file.parentId == selectedFolder.id)
                    .sort((filea, fileb) => filea.filename > fileb.filename ? 1 : -1);
                // Create div to contain tree files
                let filesDiv = document.createElement('div');
                filesDiv.className = 'tree-files';
                // Add .. file to go back
                //create the div
                let backDiv = document.createElement('div');
                backDiv.className = 'tree-file';
                backDiv.id = 'tree-file-back';
                // create a element to contain text
                let backFileName;
                backFileName = document.createElement('a');
                // add the text
                backFileName.append('..');
                backDiv.append(backFileName);
                filesDiv.append(backDiv);
                // Add files to the file div
                if (folderFiles.length > 0) {
                    for (let k = 0; k < folderFiles.length; k++) {
                        let file = folderFiles[k];
                        let fileDiv = this.createFileDiv(file, selectedFolder);
                        filesDiv.append(fileDiv);
                    }
                }
                // Append files to the folder, then folder to tree
                folderDiv.append(filesDiv);
                this.tree.append(folderDiv);
            }
        }
        createFileDiv(file, selectedFolder) {
            let fileDiv = document.createElement('div');
            fileDiv.className = 'tree-file';
            fileDiv.id = `tree-file-${file.filename}`;
            let fileName;
            fileName = document.createElement('a');
            if (file instanceof launchlink_1.LaunchLink) {
                fileName.setAttribute('href', file.content);
            }
            else {
                fileName.setAttribute('href', '#');
                fileName.setAttribute('folder', selectedFolder.name);
                fileName.className = 'query ';
            }
            fileName.className += 'tree-file-name';
            // add filename to a tag
            fileName.append(file.filename);
            // append file div to container
            fileDiv.append(fileName);
            return fileDiv;
        }
        createFolderElement(folder) {
            let folderDiv = document.createElement('div');
            folderDiv.className = 'tree-base';
            folderDiv.id = `${folder.name}`;
            let folderName = document.createElement('span');
            folderName.className = 'tree-folder-name';
            folderName.append(folder.name);
            folderDiv.append(folderName);
            return folderDiv;
        }
    }
    exports.Tree = Tree;
});
