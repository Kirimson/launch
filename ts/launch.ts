import { LaunchFolder } from "./launchfolder";
import { LaunchFile } from "./launchfile";
import { LaunchLink } from "./launchlink";
import { LaunchQuery } from "./launchquery";
import { Helper } from "./helpers";


export class Launcher {
    
    private folders: LaunchFolder[];
    private files: LaunchFile[];
    private nextFolderId = 0;
    private backgroundDefault: string = 'img/default.png'
    private background: string;
    private defaultSearch = 'g:'
    private treeHidden: boolean = false;
    private history:string[] = [''];
    private historyIndex:number;
    private color = '#333';
    private fuzzy:boolean = true;
    private privacy:boolean = true;
    private prefix:string = "$&nbsp";

    private availableCommands: string[] = ['mkdir', 'touch', 'rm', 
                                            'rmdir', 'set-bg', 'set-background',
                                            'feh', 'tree', 'set-search', 'mv', 
                                            'ls', 'set-color', 'set-colo',
                                            'colo', 'fuzzy', 'clear-hits',
                                            'set-hits', 'launch-hide-privacy',
                                            'launch-show-privacy', 'clear',
                                            'launch-help', 'set-prefix',
                                            'launch-export', 'launch-import'];

    constructor() {
        this.folders = [];
        this.files = [];
        this.background = this.backgroundDefault;
    }

    /**
     * Create default structure of launch
     */
    initLaunch(){
        this.files = [];
        this.folders = [];
        this.mkdir(['launch']);
        this.touch('launch/google.qry', 
                    'g: https://www.google.com/search?q=${}');
        this.touch('launch/bing.qry', 
                    'b: https://www.bing.com/search?q=${}');
        this.touch('launch/amazon.qry', 
                    'ama: https://www.amazon.co.uk/s/ref=nb_sb_noss_1?url=search-alias%3Daps&field-keywords=${}');
        this.touch('launch/google_maps.qry', 
                    'map: https://www.google.co.uk/maps/search/${}');
        this.touch('launch/duckduckgo.qry',
                    'ddg: https://duckduckgo.com/?q=${}');
    }

    getBackground(): string {
        return this.background;
    }

    /**
     * sets background string, used by htmltools to set background
     * @param newBackground background url/uri
     */
    setBackground(newBackground:string){
        if(newBackground == '--clear'){
            this.background = this.backgroundDefault;
        } else {
            this.background = newBackground;
        }
        return '';
    }

    getPrivacy(): boolean {
        return this.privacy;
    }

    getColor(): string {
        return this.color;
    }

    setColor(color:string){
        this.color = color;
        return '';
    }

    getCommands(): string[]{
        return this.availableCommands;
    }

    getTreeHidden(): boolean {
        return this.treeHidden;
    }

    setTreeHidden(hidden:boolean){
        this.treeHidden = hidden;
        return '';
    }

    getFolders():LaunchFolder[]{
        return this.folders;
    }

    getFiles():LaunchFile[]{
        return this.files;
    }

    isFuzzyFinderOn(){
        return this.fuzzy;
    }

    getPrefix(){
        return this.prefix;
    }

    /**
     * Returns a folder given a name
     * @param folderName folder name to search for
     */
    getFolder(folderName:string):LaunchFolder{
        // Strip trailing / if it's there
        if (folderName.endsWith("/")) {
            folderName = folderName.replace("/", "");
        }

        let parent:LaunchFolder = null;
        this.folders.forEach(folder => {
            if(folder.name == folderName){
                parent = folder;
            }
        });
        return parent;
    }

    /**
     * Returns all files that belong in a folder
     * @param foldername name of folder
     */
    getFolderFiles(foldername:string):Array<LaunchFile> {
        let folder = this.getFolder(foldername);
        
        let folderFiles: Array<LaunchFile> = this.getFolderFilesById(folder.id);
        return folderFiles;
    }

    private getFolderFilesById(folderID: number) {
        let files = this.getFiles();
        let folderFiles: Array<LaunchFile> = [];
        files.forEach(file => {
            if (file.parentId == folderID) {
                folderFiles.push(file);
            }
        });
        return folderFiles;
    }

    /**
     * Gets the index of a file to delete, given a filename
     * @param fileName file to search for
     */
    getFileID(fileName:string){
        for(let i = 0; i < this.files.length; i++) {
            let file = this.files[i]

            let fileLocation = file.getLocation()
            // Check if file matches full filename or filename w/out ext
            if(fileLocation == fileName || 
                fileLocation.substr(0,fileLocation.length-4) == fileName){
                // return index
                return i;
            }
        }
        return -1;
    }

    /**
     *  Returns a LaunchFile given a fileName
     * @param fileName Name of file to search for
     */
    getFile(fileName:string):LaunchFile{
        for(let i = 0; i < this.files.length; i++) {
            let file = this.files[i]

            let fileLocation = file.getLocation()
            // Check if file matches full filename or filename w/out ext
            if(fileLocation == fileName || 
                fileLocation.substr(0,fileLocation.length-4) == fileName){
                // return index
                return file;
            }
        }
        return null;
    }

    /**
     * Get a command one up/down in history, based on current historyIndex
     * @param up If going up the history tree or not
     */
    getHistory(up:boolean):string{
        let historyLength = this.history.length
        if(up && this.historyIndex < (this.history.length-1)){
            this.historyIndex++;
        } else if(!up && this.historyIndex > 0) {
            this.historyIndex--;
        }

        return this.history[historyLength - this.historyIndex];
    }

    /**
     * set a new default search provider. Checks if .qry shorthand exists
     * @param shorthand new shorthand to set as default
     */
    setDefaultSearch(shorthand:string){
        if (shorthand.toLowerCase() == "none"){
            this.defaultSearch = "none"
            return `Default search set to None`;
        }
        for(let i = 0; i < this.getFiles().length; i++){
            let file:LaunchFile = this.getFiles()[i];
            if(file instanceof LaunchQuery){
                // Get shorthand without the ':' in case user does no add ':'
                let fileShorthand = file.shortHand.substr(0, file.shortHand.length - 1);
                if(shorthand == fileShorthand+':' || 
                    shorthand == fileShorthand) {
                        this.defaultSearch = file.shortHand;
                        return `Info: Default search set to ${file.shortHand}`;
                }
            }
        }
        return `Error: ${shorthand} not found`
    }

    /**
     * Parses a string to find a command and execute 
     * with the provided parameters
     * @param term command with arguments
     * @returns return statement from command
     */
    execCommand(term:string):Array<string> {
        this.history.push(term);
        this.historyIndex = 0;
        let command = term.split(' ')[0];

        /** Remove the length the command of the text sent to launch to get
        the arguments to parse */

        let args = term.substr(command.length).trim();
        let commandReturn: Array<string> = [term];

        switch(command) {
            case 'mkdir':
                commandReturn.push(this.mkdir(args.split(' ')));
                break;
            case 'touch':
                commandReturn.push(this.touch(args.split(' ')[0], 
                            args.substr(args.split(' ')[0].length).trim()));
                break;
            case 'rm':
                commandReturn.push(this.rm(args));
                break;
            case 'rmdir':
                commandReturn.push(...this.rmdir(args));
                break;
            case 'feh':
            case 'set-bg':
            case 'set-background':
                commandReturn.push(this.setBackground(args));
                break;
            case 'set-color':
            case 'set-colo':
            case 'colo':
                commandReturn.push(this.setColor(args));
                break;
            case 'tree':
                commandReturn.push(this.setTreeHidden(!this.getTreeHidden()));
                break;
            case 'set-search':
                commandReturn.push(this.setDefaultSearch(args));
                break;
            case 'mv':
                commandReturn.push(this.mv(args.split(' ')[0], 
                                args.substr(args.split(' ')[0].length).trim()));
                break;
            case 'ls':
                commandReturn.push(...this.ls(args));
                break;
            case 'fuzzy':
                this.fuzzy = !this.fuzzy;
                break;
            case 'clear-hits':
                commandReturn.push(this.setHits(args));
            case 'set-hits':
                commandReturn.push(this.setHits(args.split(' ')[0],
                    parseInt(args.split(' ')[1])));
            case 'launch-hide-privacy':
                this.privacy = false; 
                break;
            case 'launch-show-privacy':
                this.privacy = true;
                break;
            case 'launch-help':
                window.location.href = 'https://github.com/Kirimson/launch/blob/master/README.md';
                break;
            case 'launch-export':
                commandReturn.push(this.launchExport(args.split(' ')));
                break;
            case 'launch-import':
                let blat = false
                if (args.split(' ')[0] == "blat") blat = true;
                this.launchImport(blat);
                break;
            case 'set-prefix':
                this.prefix = args + "&nbsp";
                $('#terminal-prefix').html(this.prefix);
                break;
            case 'clear':
                $('#terminal-history').html('');
                commandReturn = [''];
                break;
        }

        // Return commandReturn if command gave a return statement.
        // Else, return the command the user provided
        return commandReturn;
    }

    /**
     * Exports Launch to a JSON file that can then be imported by another instance
     * @param dataToExport arguments provided by the user. Expects "files" and "config".
     * if "files" is present, will export both files and folders, if "config" is present
     * will export launch configuration
     */
    launchExport(dataToExport:Array<string> = ["files"]):string {
        
        let exportFolders = {}
        let exportFiles = {}
        if (dataToExport.includes("files")) {
            exportFolders = this.exportableFolders();
            exportFiles = this.exportableFiles();
        }
        
        let exportData = {...exportFolders, ...exportFiles};
        if (dataToExport.includes("config")) {
            exportData["launch"] = this.exportableBaseData();
            // For some reason JSON.stringy ignores anything after a '#' character.
            // base.color may be a hex color code, which contains '#'. Lets replace it with (hex) to fix this
            exportData["launch"]["color"] = exportData["launch"]["color"].replace('#', '(hex)');
        }

        let exportJSON = JSON.stringify(exportData, null, 2);

        let downloadElem = document.createElement('a');
        downloadElem.href = 'data:attachment/text,' + encodeURI(exportJSON);
        downloadElem.target = '_blank';
        downloadElem.download = `launch.json`;
        downloadElem.click();

        return "Launch Exported Successfully"
    }

    readLaunchFile(file) {
        return new Promise((resolve, reject) => {
          var fr = new FileReader();  
          fr.onload = () => {
            let importObject = JSON.parse(fr.result.toString());
            resolve(importObject )
          };
          fr.onerror = reject;
          fr.readAsText(file);
        });
      }

    /**
     * Imports data from another launch instance. Can either merge the import data, or
     * configure launch exactly like the import data
     * @param blat Whether to completely overwrite the current launch data with the imported data, or to merge it in
     */
    launchImport(blat:boolean):void {
        var self = this
        let importElem = document.createElement('input');
        importElem.type = "file";
        importElem.click();
        importElem.addEventListener('change', function(){
            self.readLaunchFile(this.files[0]).then(function(importData) {
                
                if (importData['launch']) {
                    // fix up the color hex problem...
                    importData['launch']['color'] = importData['launch']['color'].replace('(hex)', '#');
                    self.loadConfig(importData['launch'])
                }
                if (blat){
                    self.files = []
                    self.folders = []
                }
                self.loadFolders(importData['folders']);
                self.loadFiles(importData['files']);
                self.store();
                location.reload();
            })
        })
    }

    /**
     * Create new folder/s from given list
     * @param args list of folders to make
     * @param readOnly if folder/s are read only
     */
    mkdir(args:string[]) {
        if(args.length == 0){
            return 'Error: no new folders were given'
        }
        let errors:string[] = []

        for(let i = 0; i < args.length; i++){
            let folderName = args[i]
            if(!this.getFolder(folderName)){
                this.folders.push(new LaunchFolder(folderName, 
                                  this.nextFolderId));
                this.nextFolderId++;
            } else {
                errors.push(folderName);
            }
        }

        if(errors.length > 0){
            let plural = errors.length == 1 ? 'folder' : 'folders';
            return `Error: ${plural} ${errors} already exists`;
        } else {
            return '';
        }
    }

    /**
     * Moves a file/folder to a new location (can be used to reanme element)
     * @param target object to move
     * @param newName new ocation
     */
    mv(target:string, newName:string):string {

        if(target.endsWith('/')){
            target = target.substr(0, target.length - 1)
        }
        let targetFolder = this.getFolder(target);
        let targetFile = this.getFile(target);

        // If a folder
        if(targetFolder){
            targetFolder.rename(newName);
            let folderFiles = this.files.filter(file => file.parentId 
                                                == targetFolder.id);
            folderFiles.forEach(file => {
               file.move(targetFolder.id, targetFolder.name ); 
            });

        } else if(targetFile) {
           
            // Check if moving folder to root
            if(newName.startsWith('/') || newName.startsWith('.')){
                // Check if new name has been given
                if(newName.substr(1)){
                    targetFile.rename(newName.substr(1));
                }
                targetFile.move(undefined, undefined);
            
            // Check if moving to a new folder
            } else if(newName.match('/')) {
                let folderFile = newName.split('/');
                let newFolder = this.getFolder(folderFile[0]);

                // Rename file if needed
                if(folderFile[1]){
                    targetFile.rename(folderFile[1]);
                }

                // Check if new folder exists to move file to
                if(newFolder){
                    targetFile.move(newFolder.id, newFolder.name);
                      
                // Folder does not exist, error
                } else {
                    return `Error: new folder '${folderFile[0]}' not found`;
                }
            //  Else just normal rename, rename the file
            } else {
                targetFile.rename(newName);
            }

        } else {
            return `Error: '${target}' not found`;
        }

        return ''
    }

    /**
     * Returns information about a folder
     * @param folderName folder the get information about
     */
    ls(folderName:string) {
        let files:Array<LaunchFile>;
        try {
            if (!folderName) {
                files = this.getFolderFilesById(undefined);
            } else {
                files = this.getFolderFiles(folderName);
            }
        } catch {
            return [`Folder ${folderName} not found`]
        }
        let fileInfoArr:Array<string> = [];

        files.forEach(file => {
            let fileInfo:string = file.filename + " - " + file.content
            fileInfoArr.push(fileInfo);
        });
        
        return fileInfoArr;
    }

    /**
     * Creates a new file, attached to a folder if provided
     * @param newFile file to create
     * @param content content to add to file
     */
    touch(newFile:string, content?:string, hits:number = 0) {
        if(newFile == ''){
            return 'Error: no filename was given'
        }

        // Check if extension is specified. If not, append .lnk
        if(!newFile.match('.lnk') && !newFile.match('.qry')){
            newFile += '.lnk';
        }

        for(let i = 0; i < this.getFiles().length; i++){
            let fileName = this.getFiles()[i].getLocation();

            if(newFile == fileName){
                return `Error: file '${newFile}' already exists`;
            }
        }

        if(newFile.match('/')) {
            let args = newFile.split('/');

            let parentFolder:LaunchFolder = this.getFolder(args[0]);
            if(parentFolder){
                this.files.push(this.createFile(args[1], content, hits,
                parentFolder.id, parentFolder.name));
            } else {
                return `Error: folder '${args[0]}' not found`;
            }

        } else {
            this.files.push(this.createFile(newFile, content, hits));
        }
    }

    /**
     * Deletes a file, if the file's parent folder is not read only
     * @param fileName name of file to delete
     */
    rm(fileName:string){

        if(fileName == '-rf'){
            this.files = [];
            this.folders = [];
            return `All Files/Folders have been deleted`;
        }

        let fileID = this.getFileID(fileName);
        if(fileID != -1){
            this.files.splice(fileID,1);
        } else {
            return `Error: file '${fileName}' not found`;
        }
        return '';
    }

    /**
     * Deletes a folder/set of folders, assuming folder is not read only
     * @param folderName string[] of folders to remove
     */
    rmdir(folderName:string){

        // If folderName has a trailing / remove it, thatv was from tab
        // autocomplete
        if(folderName.endsWith('/')) {
            folderName = folderName.substr(0, folderName.length - 1);
        }

        for(let folderID = 0; folderID < this.folders.length; folderID++) {
            let folder = this.folders[folderID];

            // Check if folder to delete is a real folder
            if(folder.name == folderName){

                let output:Array<string> = [];
                let folderFiles = this.files.filter(file => 
                    file.parentId == folder.id);

                folderFiles.forEach(file => {
                    output.push(`Deleted file: ${file.getLocation()}`)
                    this.rm(file.getLocation());
                });

                this.folders.splice(folderID,1);
                return output;
            }
        }
        return [`Error: folder '${folderName}' not found`];
    }

    /**
     * Creates a new file, file type based on filename
     * @param filename name of file to create
     * @param content file content. if undefined default to '#'
     * @param parentId folder id, if file is in a folder
     * @param parentName  folder name, if file is in a folder
     */
    createFile(filename:string, content:string, hits:number = 0, parentId?:number,
        parentName?:string): LaunchFile{
            //  Check if there is any file content
            if(!content){
                content = '#';
            }

            if(filename.match('.lnk')){
                // Ensure content is a proper url
                content = Helper.ensureHttp(content)
                return new LaunchLink(filename, content, hits, parentId, parentName);
            } else {
                return new LaunchQuery(filename, content, hits, parentId, parentName);
            }
    }

    /**
     * Executes a file given a full file name/path, such as launch/google.lnk
     * Checks if term speocfies a query and searchs based on shorthand if it is 
     * @param userString string to execute
     */
    runFile(userString:string){
        // Split with spaces if using query
        let fileName:string;
        let queryArg:string;

        // Check if using shorthand for a query file
        if(this.isQuerySearch(userString)){
            // Split the prefix from the search term
            let shorthand = userString.split(':')[0]+':'
            queryArg = userString.substr(shorthand.length).trim();
            fileName = shorthand;
        } else {
            // If file is ran using filename instead,
            // get the potential searchterm
            let stringSplit = userString.split(' ');
            // Set the filename to the first string
            fileName = stringSplit[0];
            // Set the query to the rest of the userString
            queryArg = stringSplit.slice(1, stringSplit.length).join(' ');
        }

        for(let i = 0; i < this.files.length; i++){
            let file = this.files[i];
            // Check if filename (e.g launch/google.lnk or g:) 
            // matches description of file. If so, execute that file
            if(file.toString() == fileName || file.getLocation() == fileName){
                file.hits += 1;
                this.store();
                file.execute(queryArg);
                return "";
            }
        };
        // If no macthes, use default query file
        // and properly encode the string for the query text
        let searchTerm:string = userString;
        if (this.defaultSearch != "none"){
            this.runFile(this.defaultSearch+searchTerm);
        } else return "No default search set";
    }

    /**
     * Clears the 'hitcount' a file as accumulated
     * @param fileName name of file to clear the hits of
     */
    setHits(fileName:string, newHits:number = 0){
        let fileID = this.getFileID(fileName);
        if(fileID != -1){
            let file: LaunchFile = this.files[fileID];
            file.hits = newHits;
            this.store();
        } else {
            return `Error: file '${fileName}' not found`;
        }
        return '';
    }

    /**
     * Searchs through all .lnk files given a search term
     * @param term  search term
     * @returns string[] of LaunchLink toString representations that match the 
     *          search term provided
     */
    search(term:string):string[] {
        let sortedLinks = this.files
        .filter(file => file.getLocation().match(term))
        .sort((a,b) => (a['hits'] < b['hits']) ? 1 : -1);

        let links = sortedLinks
        .map(file => file.getLocation())

        return links;
    }

    /**
     * Checks if a search string contains a query search shorthand notation
     * @param term search string passed from view
     * @returns boolean: true if search term contains query shorthand
     */
    isQuerySearch(term:string):boolean{
        // Build bang from search term if exists
        let shorthand = term.split(':')[0]+':'

        let links = this.files
        .filter(x => x instanceof LaunchQuery)
        .map(x => x.toString());

        for(let i = 0; i < links.length; i++){
            if(links[i] == shorthand){
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
    getFileFolder(file:LaunchFile):LaunchFolder{
        for(let i = 0; i < this.folders.length; i++){
            let folder:LaunchFolder = this.folders[i];
            if(folder.id == file.parentId){
                return folder;
            }
        };
        return null;
    }

    /**
     * Generates an object containing Launch files
     * @returns A serializable object for Launch's files
     */
    exportableFiles():object {
        let filesData = {'files': []}
        this.files.forEach(file => {
            let fileData = {
                'filename': file.getLocation(),
                'content': file.content,
                'hits': file.hits
            }
            filesData['files'].push(fileData);
        });

        return filesData;
    }

    /**
     * Generates an object containing Launch folders
     * @returns A serializable object for Launch's folders
     */
    exportableFolders():object {
        let foldersData = {'folders': []}
        this.folders.forEach(folder => {
            let folderData = {
                'name': folder.name,
                'id': folder.id,
            }
            foldersData['folders'].push(folderData);
        });
        return foldersData;
    }

    /**
     * Generates an object containing generic launch configuration options
     * @returns A serializable object for generic Launch configuration options
     */
    exportableBaseData():object {
        let baseData = {
            'nextFolderId': this.nextFolderId,
            'background': this.background,
            'tree': this.getTreeHidden(),
            'defaultSearch': this.defaultSearch,
            'color': this.color,
            'fuzzy': this.fuzzy,
            'privacy': this.privacy,
            'prefix': this.prefix
        }
        return baseData;
    }

    /**
     * Stores a serialized version of Launch in the browser's Local Storage
     * @returns string: stringified JSON data of Launch instance
     */
    store():void{
        let base_data = JSON.stringify(this.exportableBaseData())
        let folder_data = JSON.stringify(this.exportableFolders())
        let file_data = JSON.stringify(this.exportableFiles())

        localStorage.setItem('launch', base_data);
        localStorage.setItem('launch_folders', folder_data);
        localStorage.setItem('launch_files', file_data);
    }

    /**
     * Creates a launch instance based on it's serialised data
     * @param launch_base JSON object data of launch from localstorage
     * @returns boolean: true if loading is successful
     */
    load(launch_base:JSON, launch_folders:JSON, launch_files:JSON):boolean{
        // Try our best to import the data. If it is corrupt, return false
        try{
            // Load base config, such as background, color, prefix etc...
            this.loadConfig(launch_base);

            // Old functionality when folders where in launch_base
            if(launch_base['folders']){
                this.loadFolders(launch_base['folders']);
            } else {
                this.loadFolders(launch_folders['folders']);
            }

            // Old functionality when files were in launch_base
            if(launch_base['files']){
                this.loadFiles(launch_base['files']);
            } else {
                this.loadFiles(launch_files['files']);
            }
            return true;
        } catch(err) {
            console.log(err);
            return false;
        }
    }

    loadConfig(baseConfig:JSON) {
        this.treeHidden = baseConfig['tree'];
        this.defaultSearch = baseConfig['defaultSearch'];
        this.color = baseConfig['color'];
        this.fuzzy = baseConfig['fuzzy'];
        this.privacy = baseConfig['privacy'];
        this.prefix = baseConfig['prefix'];

        // if no prefix, set to default
        if (!this.prefix) {
            this.prefix = "$&nbsp";
        }

        //  If there is a user stored background, load it
        if(baseConfig['background']){
            this.background = baseConfig['background'];
        }
    }

    loadFolders(folders:Array<JSON>) {
        for(let i = 0; i < folders.length; i++){
            let folder = folders[i];
            this.mkdir([folder['name']]);
        };
    }

    loadFiles(files:Array<JSON>) {
        for(let x = 0; x < files.length; x++){
            let file = files[x];
            let hits = 0
            if (file['hits']){
                hits = file['hits'];
            }
            this.touch(file['filename'], file['content'], hits);
        };
    }
}