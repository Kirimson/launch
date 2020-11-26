import { LaunchFolder } from "./launchfolder";
import { LaunchFile } from "./launchfile";
import { LaunchLink } from "./launchlink";
import { LaunchQuery } from "./launchquery";


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

    private availableCommands: string[] = ['mkdir', 'touch', 'rm', 
                                            'rmdir', 'set-bg', 'set-background',
                                            'feh', 'tree', 'setsearch', 'mv',
                                            'set-color', 'set-colo', 'colo',
                                            'fuzzy', 'clear-hits', 'set-hits',
                                            'launch-hide-privacy',
                                            'launch-show-privacy',
                                            'launch-help'];

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
    
    /**
     * Checks if text contains http, if not, prepend it
     * @param text text to check
     */
    private checkHttp(text:string):string{
        let pattern = /(http(s)?:\/\/.).*/g
        if(text.match(pattern)){
            return text;
        }
        return 'http://'+text;
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

    /**
     * Returns a folder given a name
     * @param folderName folder name to search for
     */
    getFolder(folderName:string):LaunchFolder{
        let parent:LaunchFolder = null;
        this.folders.forEach(folder => {
            if(folder.name == folderName){
                parent = folder;
            }
        });
        return parent;
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
    execCommand(term:string):string {
        this.history.push(term);
        this.historyIndex = 0;
        let command = term.split(' ')[0];

        /** Remove the length the command of the text sent to launch to get
        the arguments to parse */

        let args = term.substr(command.length).trim();
        let commandReturn: string = '';

        switch(command) {
            case 'mkdir':
                commandReturn = this.mkdir(args.split(' '));
                break;
            case 'touch':
                commandReturn = this.touch(args.split(' ')[0], 
                            args.substr(args.split(' ')[0].length).trim());
                break;
            case 'rm':
                commandReturn = this.rm(args);
                break;
            case 'rmdir':
                commandReturn = this.rmdir(args);
                break;
            case 'feh':
            case 'set-bg':
            case 'set-background':
                commandReturn = this.setBackground(args);
                break;
            case 'set-color':
            case 'set-colo':
            case 'colo':
                commandReturn = this.setColor(args);
                break;
            case 'tree':
                commandReturn = this.setTreeHidden(!this.getTreeHidden());
                break;
            case 'setsearch':
                commandReturn = this.setDefaultSearch(args);
                break;
            case 'mv':
                commandReturn = this.mv(args.split(' ')[0], 
                                args.substr(args.split(' ')[0].length).trim());
                break;
            case 'fuzzy':
                commandReturn = ''
                this.fuzzy = !this.fuzzy;
                break;
            case 'clear-hits':
                commandReturn = this.setHits(args);
            case 'set-hits':
                commandReturn = this.setHits(args.split(' ')[0],
                    parseInt(args.split(' ')[1]));
            case 'launch-hide-privacy':
                this.privacy = false; 
                break;
            case 'launch-show-privacy':
                this.privacy = true;
                break;
            case 'launch-help':
                window.location.href = 'https://github.com/Kirimson/launch/blob/master/README.md';
                break;
        }

        // Return commandreturn if command gave a return statement.
        // Else, return the command the user provided
        return (commandReturn ? commandReturn : term);
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
     * Creates a new file, attached to a folder if provided
     * @param newFile file to create
     * @param content content to add to file
     */
    touch(newFile:string, content?:string, hits:number = 0) {
        if(newFile == ''){
            return 'Error: no filename was given'
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

                let folderFiles = this.files.filter(file => 
                    file.parentId == folder.id);

                folderFiles.forEach(file => {
                    this.rm(file.getLocation());
                });

                this.folders.splice(folderID,1);
                return '';
            }
        }
        return `Error: folder '${folderName}' not found`;
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

            // Check if extension is specified. If not, append .lnk
            if(!filename.match('.lnk') && !filename.match('.qry')){
                filename += '.lnk';
            }

            if(filename.match('.lnk')){
                // Check content is a proper url
                content = this.checkHttp(content)
                return new LaunchLink(filename, content, hits, parentId, parentName);
            } else {
                return new LaunchQuery(filename, content, hits, parentId, parentName);
            }
    }

    /**
     * Executes a file given a full file name/path, such as launch/google.lnk
     * Checks if term speocfies a query and searchs based on shorthand if it is 
     * @param fileName string of file name
     */
    runFile(fileName:string){
        // Split with spaces if using query
        let queryArg:string;

        if(this.isQuerySearch(fileName)){
            let shorthand = fileName.split(':')[0]+':'
            queryArg = fileName.substr(shorthand.length).trim();
            fileName = shorthand;
        }

        for(let i = 0; i < this.files.length; i++){
            let file = this.files[i];
            // Check if filename (e.g launch/google.lnk or g:) 
            // matches description of file. If so, execute that file
            if(file.toString() == fileName || file.getLocation() == fileName){
                file.hits += 1;
                this.store();
                file.execute(queryArg);
                return;
            }
        };
        this.runFile(this.defaultSearch+fileName);
    }

    /**
     * Clears the 'hitcount' a file as accumulated
     * @param fileName name of file to clear the hits of
     */
    setHits(fileName:string, newHits:number = 0){

        console.log(newHits);

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
        .filter(file => file instanceof LaunchLink)
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
     * Serialises the Launch instance into a JSON string
     * @returns string: stringified JSON data of Launch instance
     */
    store():void{

        let filesData = {'files': []}
        this.files.forEach(file => {
            let fileData = {
                'filename': file.getLocation(),
                'content': file.content,
                'hits': file.hits
            }
            filesData['files'].push(fileData);
        });

        let foldersData = {'folders': []}
        this.folders.forEach(folder => {
            let folderData = {
                'name': folder.name,
                'id': folder.id,
            }
            foldersData['folders'].push(folderData);
        })

        let data = {
            'nextFolderId': this.nextFolderId,
            'background': this.background,
            'tree': this.getTreeHidden(),
            'defaultSearch': this.defaultSearch,
            'color': this.color,
            'fuzzy': this.fuzzy,
            'privacy': this.privacy
        }

        let launch_base = JSON.stringify(data);
        let launch_folders = JSON.stringify(foldersData);
        let launch_files = JSON.stringify(filesData);

        localStorage.setItem('launch', launch_base);
        localStorage.setItem('launch_folders', launch_folders);
        localStorage.setItem('launch_files', launch_files);
    }

    /**
     * Creates a launch instance based on it's serialised data
     * @param launch_base JSON object data of launch from localstorage
     * @returns boolean: true if loading is successful
     */
    load(launch_base:JSON, launch_folders:JSON, launch_files:JSON):boolean{
        // Try our best to import the data. If it is corrupt, return false
        try{
            this.nextFolderId = 0;
            this.folders = [];
            this.files = [];
            this.treeHidden = launch_base['tree'];
            this.defaultSearch = launch_base['defaultSearch'];
            this.color = launch_base['color'];
            this.fuzzy = launch_base['fuzzy'];
            this.privacy = launch_base['privacy'];
    
            //  If there is a user stored background, load it
            if(launch_base['background']){
                this.background = launch_base['background'];
            }

            if(launch_base['folders']){
                this.loadFolders(launch_base);
            } else {
                this.loadFolders(launch_folders);
            }

            if(launch_base['files']){
                this.loadFiles(launch_base);
            } else {
                this.loadFiles(launch_files);
            }
    
            return true;
        } catch(err) {
            console.log(err);
            return false;
        }
    }

    loadFolders(folders:JSON) {
        for(let i = 0; i < folders['folders'].length; i++){
            let folder = folders['folders'][i];
            this.mkdir([folder['name']]);
        };
    }

    loadFiles(files:JSON) {
        for(let x = 0; x < files['files'].length; x++){
            let file = files['files'][x];
            let hits = 0
            if (file['hits']){
                hits = file['hits'];
            }
            this.touch(file['filename'], file['content'], hits);
        };
    }
}