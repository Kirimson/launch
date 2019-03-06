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
                let foldername = document.createElement('span');
                foldername.className = 'tree-folder-name';
                foldername.append(folder.name);
                folderDiv.append(foldername);
                let folderFiles = files.filter(x => x.parentId == folder.id);
                let fileDiv = document.createElement('div');
                this.treeBox.append(folderDiv);
            }
        }
    }
    exports.Tools = Tools;
});
