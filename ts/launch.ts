import { LaunchFolder } from "./launchfolder";
import { LaunchFile } from "./launchfile";
import { LaunchLink } from "./launchlink";
import { LaunchQuery } from "./launchquery";


export class Launcher {
    private folders:LaunchFolder[];
    private files:LaunchFile[];
    private nextFolderId = 0;
    private backgroundDefault:string = 'img/default.png'
    private background:string;

    constructor() {
        this.folders = [];
        this.files = [];
        this.background = this.backgroundDefault;
    }

    initLaunch(){
        this.mkdir(['launch'])
        this.touch('launch/google.lnk', 'https://www.google.com');
        this.touch('launch/google.qry', 'g: https://www.google.com/search?q=${}');
        this.touch('launch/bing.qry', 'b: https://www.bing.com/search?q=${}');
        this.setReadOnly('launch');
    }
    
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

    setBackground(newBackground:string){
        if(newBackground == '--clear'){
            this.background = this.backgroundDefault;
        } else {
            this.background = newBackground;
        }
    }

    getFolders():LaunchFolder[]{
        return this.folders;
    }

    getFiles():LaunchFile[]{
        return this.files;
    }

    mkdir(args:string[], readOnly:boolean=false) {
        args.forEach(folderName => {
            if(!this.getFolder(folderName)){
                this.folders.push(new LaunchFolder(folderName, this.nextFolderId,
                                  readOnly))
                this.nextFolderId++;
            }
        });
    }

    setReadOnly(folderName:string){
        let folder = this.getFolder(folderName);

        if(folder){
            folder.setReadOnly(true)
        }
    }

    getFolder(folderName:string):LaunchFolder{
        let parent:LaunchFolder = null;
        this.folders.forEach(folder => {
            if(folder.name == folderName){
                parent = folder;
            }
        });
        return parent;
    }

    touch(newFile:string, content?:string) {
        if(newFile.match('/')) {
            let args = newFile.split('/');

            let parentFolder:LaunchFolder = this.getFolder(args[0]);

            this.files.push(this.createFile(args[1], content, 
            parentFolder.id, parentFolder.name))
        } else {
            this.files.push(this.createFile(newFile, content))
        }
    }

    /**
     * Deletes a file, if the file's parent folder is not read only
     * @param fileName name of file to delete
     */
    rm(fileName:string){
        let fileID = this.getFileID(fileName);
        if(fileID != -1){
            let file = this.files[fileID];
            // If file is in a folder
            if(file.parentId != undefined){
                // If folder file is in is not ready only, remove it
                if(!this.getFileFolder(file).isReadOnly()){
                    this.files.splice(fileID,1)
                }
            } else {
                this.files.splice(fileID,1)
            }
        }
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
     * Deletes a folder/set of folders, assuming folder is not read only
     * @param folderNames string[] of folders to remove
     */
    rmdir(folderNames:string[]){
        folderNames.forEach(folderName => {
            for(let folderID = 0; folderID < this.folders.length; folderID++) {
                let folder = this.folders[folderID];
    
                if(folder.name == folderName && folder.isReadOnly() == false){
    
                    let folderFiles = this.files.filter(file => 
                        file.parentId == folder.id);
    
                    folderFiles.forEach(file => {
                        this.rm(file.getLocation())
                    });
    
                    this.folders.splice(folderID,1)
                }
            }
        });
    }

    /**
     * Creates a new file, file type based on filename
     * @param filename name of file to create
     * @param content file content. if undefined default to '#'
     * @param parentId folder id, if file is in a folder
     * @param parentName  folder name, if file is in a folder
     */
    createFile(filename:string, content:string, parentId?:number,
        parentName?:string): LaunchFile{
            //  Check if there is any file content
            if(!content){
                content = '#'
            }

            // Check if extension is specified. If not, append .lnk


            if(filename.match('.lnk')){
                // Check content is a proper url
                content = this.checkHttp(content)
                return new LaunchLink(filename, content, parentId, parentName)
            } else {
                return new LaunchQuery(filename, content, parentId, parentName)
            }
    }

    /**
     * Executes a file given a full file name/path, such as launch/google.lnk
     * Checks if term speocfies a query and searchs based on shorthand if it is 
     * @param fileName string of file name
     */
    runFile(fileName:string){

        // Split with spaces if using query
        let queryArg:string

        if(this.isQuerySearch(fileName)){
            fileName = fileName.split(':')[0]+':'
            queryArg = fileName.substr(fileName.length).trim();
        }

        for(let i = 0; i < this.files.length; i++){
            let file = this.files[i];
            // Check if filename (e.g launch/google.lnk or g:) 
            // matches description of file. If so, execute that file
            if(file.toString() == fileName){
                file.execute(queryArg)
                return
            }
        };

        this.runFile('g: '+fileName)
        return
    }

    /**
     * Parses a string to find a command and execute 
     * with the provided parameters
     * @param term command with arguments
     */
    execCommand(term:string){
        let command = term.split(' ')[0]

        /** Remove the length the command of the text sent to launch to get
        the arguments to parse */

        let args = term.substr(command.length).trim();

        switch(command) {
            case 'mkdir':
                this.mkdir(args.split(' '))
                break;
            case 'touch':
                this.touch(args.split(' ')[0], args.split(' ')[1])
                break;
            case 'rm':
                this.rm(args)
                break;
            case 'rmdir':
                this.rmdir(args.split(' '))
                break;
            case 'feh':
                this.setBackground(args)
        }
    }

    /**
     * Searchs through all .lnk files given a search term
     * @param term  search term
     * @returns string[] of LaunchLink toString representations that match the 
     *          search term provided
     */
    search(term:string):string[] {
        let links = this.files
        .filter(file => file instanceof LaunchLink)
        .map(file => file.toString())
        .filter(file => file.match(term));

        return links
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
                return true
            }
        }

        return false
    }

    /**
     * Lists available commands
     * @returns string[]: array fo available commands
     */
    getCommands():string[] {
        return ['mkdir', 'touch', 'rm', 'rmdir', 'feh']
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
        return null
    }

    /**
     * Serialises the Launch instance into a JSON string
     * @returns string: stringified JSON data of Launch instance
     */
    store():string{

        let filesData = []
        this.files.forEach(file => {
            let fileData = {
                'filename': file.getLocation(),
                'content': file.content,
            }
            filesData.push(fileData)
        });

        let foldersData = []
        this.folders.forEach(folder => {
            let folderData = {
                'folderName': folder.folderName,
                'id': folder.id,
                'name': folder.name,
                'readonly': folder.isReadOnly()
            }
            foldersData.push(folder)
        })

        let data = {
            'nextFolderId': this.nextFolderId,
            'files': filesData,
            'folders': foldersData,
            'background': this.background
        }

        return JSON.stringify(data)
    }

    /**
     * Creates a launch instance based on it's serialised data
     * @param data JSON object data of launch from localstorage
     * @returns boolean: true if loading is successful
     */
    load(data:JSON):boolean{
        console.log(data)
        if(data['folders'].length == 0 || data['files'].length == 0){
            console.error('YOU BROKE LAUNCH. YOU MONSTER!');
            return false;
        }

        this.nextFolderId = 0
        this.folders = []
        this.files = []

        //  If there is a user stored background, load it
        if(data['background']){
            this.background = data['background']
        }

        for(let i = 0; i < data['folders'].length; i++){
            let folder = data['folders'][i];
            let readOnly:boolean = (folder['readOnly'] ? true : false)
            this.mkdir([folder['folderName']], readOnly);
        };

        for(let x = 0; x < data['files'].length; x++){
            let file = data['files'][x];
            this.touch(file['filename'], file['content']);
        };

        return true;
    }
}