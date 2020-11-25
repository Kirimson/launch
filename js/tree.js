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
            for (let i = 0; i < folders.length; i++) {
                let folder = folders[i];
                // Create folder div element
                let folderDiv = this.createFolderElement(folder);
                // If current folder is selected, need to display files
                if (folderID == folder['id']) {
                    // Get files that belong to this folder
                    let folderFiles = files.filter(file => file.parentId == folder.id)
                        .sort((filea, fileb) => filea.filename > fileb.filename ? 1 : -1);
                    // Create div to contain tree files
                    let filesDiv = document.createElement('div');
                    filesDiv.className = 'tree-files';
                    // Add files to the file div
                    if (folderFiles.length > 0) {
                        for (let k = 0; k < folderFiles.length; k++) {
                            let file = folderFiles[k];
                            let fileDiv = this.createFileElement(file, folder);
                            filesDiv.append(fileDiv);
                        }
                    }
                    // Append files to the folder
                    folderDiv.append(filesDiv);
                }
                // add folder to the tree
                this.tree.append(folderDiv);
                // if selected folder matches, add a spacer 
                if (folderID == folder['id']) {
                    let spacer = document.createElement('div');
                    spacer.className = 'tree-spacer';
                    spacer.insertAdjacentHTML('beforeend', "&nbsp;");
                    this.tree.append(spacer);
                }
            }
            // Files that do not belong in a folder
            let orphanedFiles = files
                .filter(file => file.parentId == undefined)
                .sort((filea, fileb) => filea.filename > fileb.filename ? 1 : -1);
            for (let i = 0; i < orphanedFiles.length; i++) {
                let file = orphanedFiles[i];
                let orphanDiv = this.createFileElement(file);
                this.tree.append(orphanDiv);
            }
        }
        createFileElement(file, selectedFolder) {
            let fileDiv = document.createElement('div');
            if (selectedFolder) {
                fileDiv.className = 'file tree-file';
            }
            else {
                fileDiv.className = 'tree-base';
            }
            fileDiv.id = `tree-file-${file.filename}`;
            let fileName;
            fileName = document.createElement('a');
            if (file instanceof launchlink_1.LaunchLink) {
                fileName.setAttribute('href', file.content);
                fileName.className = 'link ';
            }
            else {
                fileName.setAttribute('href', '#');
                if (selectedFolder) {
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
