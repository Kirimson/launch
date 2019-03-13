define(["require", "exports", "./launchfolder", "./launchlink", "./launchquery"], function (require, exports, launchfolder_1, launchlink_1, launchquery_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Launcher {
        constructor() {
            this.nextFolderId = 0;
            this.backgroundDefault = 'img/default.png';
            this.folders = [];
            this.files = [];
            this.background = this.backgroundDefault;
        }
        checkHttp(text) {
            let pattern = /(http(s)?:\/\/.).*/g;
            if (text.match(pattern)) {
                return text;
            }
            return 'http://' + text;
        }
        getBackground() {
            return this.background;
        }
        setBackground(newBackground) {
            if (newBackground == '--clear') {
                this.background = this.backgroundDefault;
            }
            else {
                this.background = newBackground;
            }
        }
        getFolders() {
            return this.folders;
        }
        getFiles() {
            return this.files;
        }
        mkdir(args, readOnly = false) {
            args.forEach(folderName => {
                if (!this.getFolder(folderName)) {
                    this.folders.push(new launchfolder_1.LaunchFolder(folderName, this.nextFolderId, readOnly));
                    this.nextFolderId++;
                }
            });
        }
        setReadOnly(folderName) {
            let folder = this.getFolder(folderName);
            if (folder) {
                folder.setReadOnly(true);
            }
        }
        getFolder(folderName) {
            let parent = null;
            this.folders.forEach(folder => {
                if (folder.name == folderName) {
                    parent = folder;
                }
            });
            return parent;
        }
        touch(newFile, content) {
            if (newFile.match('/')) {
                let args = newFile.split('/');
                let parentFolder = this.getFolder(args[0]);
                this.files.push(this.createFile(args[1], content, parentFolder.id, parentFolder.name));
            }
            else {
                this.files.push(this.createFile(newFile, content));
            }
        }
        rm(fileName) {
            let fileID = this.getFileID(fileName);
            if (fileID) {
                // If folder file is in is not ready only, remove it
                if (!this.getFileFolder(this.files[fileID]).isReadOnly()) {
                    this.files.splice(fileID, 1);
                }
            }
        }
        getFileID(fileName) {
            for (let i = 0; i < this.files.length; i++) {
                let file = this.files[i];
                let fileLocation = file.getLocation();
                // Check if file matches full filename or filename w/out ext
                if (fileLocation == fileName ||
                    fileLocation.substr(0, fileLocation.length - 4) == fileName) {
                    // return index
                    return i;
                }
            }
            return false;
        }
        rmdir(folderName) {
            for (let folderID = 0; folderID < this.folders.length; folderID++) {
                let folder = this.folders[folderID];
                if (folder.name == folderName && folder.isReadOnly() == false) {
                    let folderFiles = this.files.filter(file => file.parentId == folder.id);
                    folderFiles.forEach(file => {
                        this.rm(file.getLocation());
                    });
                    this.folders.splice(folderID, 1);
                }
            }
        }
        createFile(filename, content, parentId, parentName) {
            //  Check if there is any file content
            if (!content) {
                content = '#';
            }
            // Check if extension is specified. If not, append .lnk
            if (filename.match('.lnk')) {
                // Check content is a proper url
                content = this.checkHttp(content);
                return new launchlink_1.LaunchLink(filename, content, parentId, parentName);
            }
            else {
                return new launchquery_1.LaunchQuery(filename, content, parentId, parentName);
            }
        }
        // Needs full path to execute, e.g launch/google.link
        runFile(entry) {
            // Split with spaces if using query
            let queryArg;
            let fileName = entry;
            if (this.isQuerySearch(entry)) {
                fileName = entry.split(':')[0] + ':';
                queryArg = entry.substr(fileName.length).trim();
            }
            for (let i = 0; i < this.files.length; i++) {
                let file = this.files[i];
                // Check if filename (e.g launch/google.lnk or g:) 
                // matches description of file. If so, execute that file
                if (file.toString() == fileName) {
                    file.execute(queryArg);
                    return;
                }
            }
            ;
            this.runFile('g: ' + entry);
            return;
        }
        execCommand(term) {
            let command = term.split(' ')[0];
            /** Remove the length the command of the text sent to launch to get
            the arguments to parse */
            let args = term.substr(command.length).trim();
            switch (command) {
                case 'mkdir':
                    this.mkdir(args.split(' '));
                    break;
                case 'touch':
                    this.touch(args.split(' ')[0], args.split(' ')[1]);
                    break;
                case 'rm':
                    this.rm(args);
                    break;
                case 'rmdir':
                    this.rmdir(args);
                    break;
                case 'feh':
                    this.setBackground(args);
            }
        }
        /**
         * Searchs through all .lnk files given a search term
         * @param term  search term
         * @returns string[] of LaunchLink toString representations that match the
         *          search term provided
         */
        search(term) {
            let links = this.files
                .filter(file => file instanceof launchlink_1.LaunchLink)
                .map(file => file.toString())
                .filter(file => file.match(term));
            return links;
        }
        isQuerySearch(term) {
            // Build bang from search term if exists
            let bang = term.split(':')[0] + ':';
            let links = this.files
                .filter(x => x instanceof launchquery_1.LaunchQuery)
                .map(x => x.toString());
            for (let i = 0; i < links.length; i++) {
                if (links[i] == bang) {
                    return true;
                }
            }
            return false;
        }
        getCommands() {
            return ['mkdir', 'touch', 'rm', 'rmdir', 'feh'];
        }
        /**
         * Get a files folder
         * @param file File to get folder of
         * @returns LaunchFolder of file's folder
         */
        getFileFolder(file) {
            this.folders.forEach(folder => {
                if (folder.id == file.parentId) {
                    return folder;
                }
            });
            return null;
        }
        store() {
            let filesData = [];
            this.files.forEach(file => {
                let fileData = {
                    'filename': file.getLocation(),
                    'content': file.content,
                };
                filesData.push(fileData);
            });
            let foldersData = [];
            this.folders.forEach(folder => {
                let folderData = {
                    'folderName': folder.folderName,
                    'id': folder.id,
                    'name': folder.name,
                    'readonly': folder.isReadOnly()
                };
                foldersData.push(folder);
            });
            let data = {
                'nextFolderId': this.nextFolderId,
                'files': filesData,
                'folders': foldersData,
                'background': this.background
            };
            return JSON.stringify(data);
        }
        /**
         * Creates a launch instance based on it's serialised data
         * @param data JSON object data of launch from localstorage
         * @returns boolean: true if loading is successful
         */
        load(data) {
            console.log(data);
            if (data['folders'].length == 0 || data['files'].length == 0) {
                console.error('YOU BROKE LAUNCH. YOU MONSTER!');
                return false;
            }
            this.nextFolderId = 0;
            this.folders = [];
            this.files = [];
            //  If there is a user stored background, load it
            if (data['background']) {
                this.background = data['background'];
            }
            for (let i = 0; i < data['folders'].length; i++) {
                let folder = data['folders'][i];
                let readOnly = (folder['readOnly'] ? true : false);
                this.mkdir([folder['folderName']], readOnly);
            }
            ;
            for (let x = 0; x < data['files'].length; x++) {
                let file = data['files'][x];
                this.touch(file['filename'], file['content']);
            }
            ;
            return true;
        }
    }
    exports.Launcher = Launcher;
});
