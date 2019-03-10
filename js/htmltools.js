define(["require", "exports", "loader"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Tools {
        constructor() {
            this.launchBox = $('#console');
            this.treeBox = $('#tree');
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
        setTreeHtml(launch) {
            let folders = launch.getFolders();
            let files = launch.getFiles();
            this.treeBox.html('');
            for (let i = 0; i < folders.length; i++) {
                let folder = folders[i];
                // Create folder div element
                let folderDiv = document.createElement('div');
                folderDiv.className = 'tree-folder';
                folderDiv.id = folder.name + '-folder';
                let folderName = document.createElement('span');
                folderName.className = 'tree-folder-name';
                folderName.append(folder.name);
                folderDiv.append(folderName);
                // Get files that belong to this folder
                let folderFiles = files.filter(x => x.parentId == folder.id);
                let filesDiv = document.createElement('div');
                filesDiv.className = 'tree-files';
                if (folderFiles.length > 0) {
                    // Go through all files in folder and ad to div
                    for (let k = 0; k < folderFiles.length; k++) {
                        let file = folderFiles[k];
                        console.log(k);
                        console.log(file.filename);
                        let fileDiv = document.createElement('div');
                        fileDiv.className = 'tree-file';
                        fileDiv.id = 'tree-file-' + file.filename;
                        let fileName = document.createElement('span');
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
        }
    }
    exports.Tools = Tools;
});
