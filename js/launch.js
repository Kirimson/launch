define(["require", "exports", "./launchfolder", "./launchlink", "./launchquery"], function (require, exports, launchfolder_1, launchlink_1, launchquery_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Launcher {
        constructor() {
            this.nextFolderId = 0;
            this.backgroundDefault = 'img/default.png';
            this.defaultSearch = 'g:';
            this.treeHidden = true;
            this.availableCommands = ['mkdir', 'touch', 'rm',
                'rmdir', 'feh', 'tree',
                'setsearch'];
            this.folders = [];
            this.files = [];
            this.background = this.backgroundDefault;
        }
        /**
         * Create default structure of launch
         */
        initLaunch() {
            this.mkdir(['launch']);
            this.touch('launch/google.lnk', 'https://www.google.com');
            this.touch('launch/google.qry', 'g: https://www.google.com/search?q=${}');
            this.touch('launch/bing.qry', 'b: https://www.bing.com/search?q=${}');
            this.setReadOnly('launch');
        }
        /**
         * Checks if text contains http, if not, prepend it
         * @param text text to check
         */
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
        /**
         * sets background string, used by htmltools to set background
         * @param newBackground background url/uri
         */
        setBackground(newBackground) {
            if (newBackground == '--clear') {
                this.background = this.backgroundDefault;
            }
            else {
                this.background = newBackground;
            }
            return '';
        }
        getCommands() {
            return this.availableCommands;
        }
        getTreeHidden() {
            return this.treeHidden;
        }
        setTreeHidden(hidden) {
            this.treeHidden = hidden;
            return '';
        }
        getFolders() {
            return this.folders;
        }
        getFiles() {
            return this.files;
        }
        /**
         * set a new default search provider. Checks if .qry shorthand exists
         * @param shorthand new shorthand to set as default
         */
        setDefaultSearch(shorthand) {
            for (let i = 0; i < this.getFiles().length; i++) {
                let file = this.getFiles()[i];
                if (file instanceof launchquery_1.LaunchQuery) {
                    // Get shorthand without the ':' in case user does no add ':'
                    let fileShorthand = file.shortHand.substr(0, file.shortHand.length - 1);
                    if (shorthand == fileShorthand + ':' ||
                        shorthand == fileShorthand) {
                        this.defaultSearch = file.shortHand;
                        return `Default search set to ${file.shortHand}`;
                    }
                }
            }
            return `Error: No shorthand for ${shorthand} found`;
        }
        /**
         * Create new folder/s from given list
         * @param args list of folders to make
         * @param readOnly if folder/s are read only
         */
        mkdir(args, readOnly = false) {
            let errors = [];
            for (let i = 0; i < args.length; i++) {
                let folderName = args[i];
                if (!this.getFolder(folderName)) {
                    this.folders.push(new launchfolder_1.LaunchFolder(folderName, this.nextFolderId, readOnly));
                    this.nextFolderId++;
                }
                else {
                    errors.push(folderName);
                }
            }
            if (errors.length > 0) {
                let plural = errors.length == 1 ? 'folder' : 'folders';
                return `Error: ${plural} ${errors} already exists.`;
            }
            else {
                return '';
            }
        }
        /**
         * sets a folder as read only
         * @param folderName folder to set as readOnly
         */
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
        /**
         * Creates a new file, attached to a folder if provided
         * @param newFile file to create
         * @param content content to add to file
         */
        touch(newFile, content) {
            for (let i = 0; i < this.getFiles().length; i++) {
                let fileName = this.getFiles()[i].getLocation();
                if (newFile == fileName) {
                    return `Error: file ${newFile} already exists`;
                }
            }
            if (newFile.match('/')) {
                let args = newFile.split('/');
                let parentFolder = this.getFolder(args[0]);
                if (parentFolder) {
                    this.files.push(this.createFile(args[1], content, parentFolder.id, parentFolder.name));
                }
                else {
                    return `Error: folder ${args[0]} does not exist. 
                Run 'mkdir ${args[0]}' first`;
                }
            }
            else {
                this.files.push(this.createFile(newFile, content));
            }
        }
        /**
         * Deletes a file, if the file's parent folder is not read only
         * @param fileName name of file to delete
         */
        rm(fileName) {
            if (fileName == '-rf') {
                this.files = [];
                this.folders = [];
                return `[K[[1;31m TIME [0m] Timed out waiting for device launch.
            <br/>
            [[1;33mDEPEND[0m] Dependency failed for /.
            <br/>
            [[1;33mDEPEND[0m] Dependency failed for Local File Systems.
            <br/>
            …
            <br/>
            Welcome to emergency mode! Please refresh to rebuild launch...`;
            }
            let fileID = this.getFileID(fileName);
            if (fileID != -1) {
                let file = this.files[fileID];
                // If file is in a folder
                if (file.parentId != undefined) {
                    // If folder file is in is not ready only, remove it
                    if (!this.getFileFolder(file).isReadOnly()) {
                        this.files.splice(fileID, 1);
                    }
                }
                else {
                    this.files.splice(fileID, 1);
                }
            }
            else {
                return `Error: file ${fileName} not found`;
            }
            return '';
        }
        /**
         * Gets the index of a file to delete, given a filename
         * @param fileName file to search for
         */
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
            return -1;
        }
        /**
         * Deletes a folder/set of folders, assuming folder is not read only
         * @param folderNames string[] of folders to remove
         */
        rmdir(folderNames) {
            let errors = [];
            for (let i = 0; i < folderNames.length; i++) {
                let folderName = folderNames[i];
                for (let folderID = 0; folderID < this.folders.length; folderID++) {
                    let folder = this.folders[folderID];
                    // Check if folder to delete is a real folder
                    if (folder.name == folderName && folder.isReadOnly() == false) {
                        let folderFiles = this.files.filter(file => file.parentId == folder.id);
                        folderFiles.forEach(file => {
                            this.rm(file.getLocation());
                        });
                        this.folders.splice(folderID, 1);
                    }
                    else {
                        errors.push(folderName);
                    }
                }
            }
            ;
            if (errors.length > 0) {
                let pluralFolders = errors.length == 1 ? 'folder' : 'folders';
                let pluralDo = errors.length == 1 ? 'does' : 'do';
                return `Error: ${pluralFolders} ${errors} ${pluralDo} not exist.`;
            }
            else {
                return '';
            }
        }
        /**
         * Creates a new file, file type based on filename
         * @param filename name of file to create
         * @param content file content. if undefined default to '#'
         * @param parentId folder id, if file is in a folder
         * @param parentName  folder name, if file is in a folder
         */
        createFile(filename, content, parentId, parentName) {
            //  Check if there is any file content
            if (!content) {
                content = '#';
            }
            // Check if extension is specified. If not, append .lnk
            if (!filename.match('.lnk') && !filename.match('.qry')) {
                filename += '.lnk';
            }
            if (filename.match('.lnk')) {
                // Check content is a proper url
                content = this.checkHttp(content);
                return new launchlink_1.LaunchLink(filename, content, parentId, parentName);
            }
            else {
                return new launchquery_1.LaunchQuery(filename, content, parentId, parentName);
            }
        }
        /**
         * Executes a file given a full file name/path, such as launch/google.lnk
         * Checks if term speocfies a query and searchs based on shorthand if it is
         * @param fileName string of file name
         */
        runFile(fileName) {
            // Split with spaces if using query
            let queryArg;
            if (this.isQuerySearch(fileName)) {
                let shorthand = fileName.split(':')[0] + ':';
                queryArg = fileName.substr(shorthand.length).trim();
                fileName = shorthand;
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
            this.runFile(this.defaultSearch + fileName);
            return;
        }
        /**
         * Parses a string to find a command and execute
         * with the provided parameters
         * @param term command with arguments
         * @returns return statement from command
         */
        execCommand(term) {
            let command = term.split(' ')[0];
            /** Remove the length the command of the text sent to launch to get
            the arguments to parse */
            let args = term.substr(command.length).trim();
            let commandReturn = '';
            switch (command) {
                case 'mkdir':
                    commandReturn = this.mkdir(args.split(' '));
                    break;
                case 'touch':
                    commandReturn = this.touch(args.split(' ')[0], args.substr(args.split(' ')[0].length).trim());
                    break;
                case 'rm':
                    commandReturn = this.rm(args);
                    break;
                case 'rmdir':
                    commandReturn = this.rmdir(args.split(' '));
                    break;
                case 'feh':
                    commandReturn = this.setBackground(args);
                    break;
                case 'tree':
                    commandReturn = this.setTreeHidden(!this.getTreeHidden());
                    break;
                case 'setsearch':
                    commandReturn = this.setDefaultSearch(args);
                    break;
            }
            // Return commandreturn if command gave a return statement.
            // Else, return the command the user provided
            return (commandReturn ? commandReturn : term);
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
        /**
         * Checks if a search string contains a query search shorthand notation
         * @param term search string passed from view
         * @returns boolean: true if search term contains query shorthand
         */
        isQuerySearch(term) {
            // Build bang from search term if exists
            let shorthand = term.split(':')[0] + ':';
            let links = this.files
                .filter(x => x instanceof launchquery_1.LaunchQuery)
                .map(x => x.toString());
            for (let i = 0; i < links.length; i++) {
                if (links[i] == shorthand) {
                    return true;
                }
            }
            return false;
        }
        /**
         * Get a files folder
         * @param file File to get folder of
         * @returns LaunchFolder of file's folder
         */
        getFileFolder(file) {
            for (let i = 0; i < this.folders.length; i++) {
                let folder = this.folders[i];
                if (folder.id == file.parentId) {
                    return folder;
                }
            }
            ;
            return null;
        }
        /**
         * Serialises the Launch instance into a JSON string
         * @returns string: stringified JSON data of Launch instance
         */
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
                'background': this.background,
                'tree': this.getTreeHidden(),
                'defaultSearch': this.defaultSearch
            };
            return JSON.stringify(data);
        }
        /**
         * Creates a launch instance based on it's serialised data
         * @param data JSON object data of launch from localstorage
         * @returns boolean: true if loading is successful
         */
        load(data) {
            if (data['folders'].length == 0 || data['files'].length == 0) {
                console.error('YOU BROKE LAUNCH. YOU MONSTER!');
                return false;
            }
            this.nextFolderId = 0;
            this.folders = [];
            this.files = [];
            this.treeHidden = data['tree'];
            this.defaultSearch = data['defaultSearch'];
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
