define(["require", "exports", "./launch", "loader"], function (require, exports, launch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Tools {
        constructor() {
            this.launchBox = $('#console');
            this.treeBox = $('#tree');
            this.body = document.body;
        }
        getLaunchBox() {
            return this.launchBox;
        }
        getLaunchBoxValue() {
            return String(this.launchBox.val());
        }
        clearLaunchBox() {
            this.launchBox.val('');
        }
        setBackground(background_url) {
            this.body.style.backgroundImage = `url(${background_url})`;
        }
        updateTree(launch) {
            let folders = launch.getFolders()
                .sort((foldera, folderb) => foldera.name > folderb.name ? 1 : -1);
            let files = launch.getFiles();
            this.treeBox.html('');
            for (let i = 0; i < folders.length; i++) {
                let folder = folders[i];
                // Create folder div element
                let folderDiv = document.createElement('div');
                folderDiv.className = 'tree-base';
                folderDiv.id = `tree-folder-${folder.name}`;
                let folderName = document.createElement('span');
                folderName.className = 'tree-folder-name';
                folderName.append(folder.name);
                folderDiv.append(folderName);
                // Get files that belong to this folder
                let folderFiles = files.filter(file => file.parentId == folder.id)
                    .sort((filea, fileb) => filea.filename > fileb.filename ? 1 : -1);
                let filesDiv = document.createElement('div');
                filesDiv.className = 'tree-files';
                if (folderFiles.length > 0) {
                    // Go through all files in folder and ad to div
                    for (let k = 0; k < folderFiles.length; k++) {
                        let file = folderFiles[k];
                        let fileDiv = document.createElement('div');
                        fileDiv.className = 'tree-file';
                        fileDiv.id = `tree-file-${file.filename}`;
                        let fileName;
                        if (file instanceof launch_1.LaunchLink) {
                            fileName = document.createElement('a');
                            fileName.setAttribute('href', file.content);
                        }
                        else {
                            fileName = document.createElement('span');
                        }
                        fileName.className = 'tree-file-name';
                        fileName.append(file.filename);
                        fileDiv.append(fileName);
                        filesDiv.append(fileDiv);
                    }
                    // Add this fodlers files div to it
                    folderDiv.append(filesDiv);
                }
                this.treeBox.append(folderDiv);
            }
            // Files that do not belong in a folder
            let orphanedFiles = files
                .filter(file => file.parentId == undefined)
                .sort((filea, fileb) => filea.filename > fileb.filename ? 1 : -1);
            for (let i = 0; i < orphanedFiles.length; i++) {
                let file = orphanedFiles[i];
                console.log(file);
                // Create folder div element
                let orphanDiv = document.createElement('div');
                orphanDiv.className = 'tree-base';
                orphanDiv.id = `tree-file-${file.filename}`;
                let fileName;
                if (file instanceof launch_1.LaunchLink) {
                    fileName = document.createElement('a');
                    fileName.setAttribute('href', file.content);
                }
                else {
                    fileName = document.createElement('span');
                }
                fileName.append(file.filename);
                orphanDiv.append(fileName);
                this.treeBox.append(orphanDiv);
            }
        }
    }
    exports.Tools = Tools;
});
