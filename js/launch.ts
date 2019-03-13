enum LaunchFileTypes {
    Link,
    Query
}

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

    mkdir(args:string[]) {
        args.forEach(folderName => {
            this.folders.push(new LaunchFolder(folderName, this.nextFolderId))
            this.nextFolderId++;
        });
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

    rm(fileName:string){
        let fileID = this.getFileid(fileName);
        if(fileID){
            // this.files.pop()
            this.files.splice(fileID,1)
        }
    }


    getFileid(fileName:string){
        for(let i = 0; i < this.files.length; i++) {
            let file = this.files[i]
            console.log(file.filename)
            let fileLocation = file.getLocation()
            // Check if file matches full filename or filename w/out ext
            if(fileLocation == fileName || 
                fileLocation.substr(0,fileLocation.length-4) == fileName){
                // return index
                return i;
            }
        }
        return false;
    }

    createFile(filename:string, content:string, parentId?:number,
        parentName?:string): LaunchFile{
            //  Check if there is any file content
            if(!content){
                content = '#'
            }

            // Check if extension is specified. If not, append .lnk

            if(this.checkFileType(filename) == LaunchFileTypes.Link){
                // Check content is a proper url
                content = this.checkHttp(content)
                return new LaunchLink(filename, content, parentId, parentName)
            } else {
                return new LaunchQuery(filename, content, parentId, parentName)
            }
    }

    checkFileType(filename:string){
        if(filename.match('.lnk')){
            return LaunchFileTypes.Link;
        }
        return LaunchFileTypes.Query;
    }

    // Needs full path to execute, e.g launch/google.link
    runFile(entry:string){

        // Split with spaces if using query
        let queryArg:string
        let fileName = entry

        if(this.isQuerySearch(entry)){
            fileName = entry.split(':')[0]+':'
            queryArg = entry.substr(fileName.length).trim();
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

        this.runFile('g: '+entry)
        return
    }

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
                // TODO rmdir
                break;
            case 'feh':
                this.setBackground(args)
        }
    }

    /**
     *  Searchs through all .lnk files given a search terms
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

    isQuerySearch(term:string):boolean{
        // Build bang from search term if exists
        let bang = term.split(':')[0]+':'

        let links = this.files
        .filter(x => x instanceof LaunchQuery)
        .map(x => x.toString());

        for(let i = 0; i < links.length; i++){
            if(links[i] == bang){
                return true
            }
        }

        return false
    }

    getCommands():string[] {
        return ['mkdir', 'touch', 'rm', 'rmdir', 'feh']
    }

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
                'name': folder.name
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

    load(data:JSON){
        this.nextFolderId = 0
        this.folders = []
        this.files = []

        //  If there is a user stored background, load it
        if(data['background']){
            this.background = data['background']
        }

        for(let i = 0; i < data['folders'].length; i++){
            let folder = data['folders'][i];
            this.mkdir([folder['folderName']])
        };

        for(let x = 0; x < data['files'].length; x++){
            let file = data['files'][x];
            this.touch(file['filename'], file['content'])
        };
    }
}

export class LaunchFolder {

    public files:LaunchFile[];
    public id:number;
    public name:string;

    constructor(public folderName:string, folderid:number){
        this.id = folderid;
        this.name = folderName;
    }
}

export class LaunchFile {
    
    // ID number of folder is used, to avoid cyclic references that cannot
    // be serialised easily
    constructor(public filename:string, 
        public content:string, public parentId?:number, 
        public parentName?:string){}

    getLocation():string {
        if(this.parentName){
            return this.parentName + '/' + this.filename;
        } else return this.filename;
    }
    
    // Overrriden functions
    execute(queryArg?:string){}
    toString():string{return ''}
}

export class LaunchLink extends LaunchFile {
    
    constructor(public filename:string, 
        public content:string, public parentId?:number, 
        public parentName?:string){
            super(filename, content, parentId, parentName)
        }

    execute() {
        window.location.href = this.content;
    }

    toString():string {
        return this.getLocation().slice(0,-4);
    }
}

export class LaunchQuery extends LaunchFile{

    public shortHand:string
    public link:string

    constructor(public filename:string,
        public content:string, public parentId?:number, 
        public parentName?:string){
            super(filename, content, parentId, parentName)

            this.shortHand = content.substr(0,content.indexOf(' '));
            this.link = content.substr(content.indexOf(' ')+1);
        }
    
    execute(queryArg:string){
        window.location.href = this.link.replace('${}', queryArg);        
    }

    toString():string {
        return this.shortHand;
    }
}