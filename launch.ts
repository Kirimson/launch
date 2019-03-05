enum LaunchFileTypes {
    Link,
    Query
}

export class Launcher {

    public folders:LaunchFolder[];
    public files:LaunchFile[];
    public nextFolderId = 0;

    constructor() {
        this.folders = []
        this.files = []
        this.mkdir(['launch'])
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
            this.files.push(this.createFile(newFile, ''))
        }
    }

    createFile(filename:string, content:string, parentId?:number,
        parentName?:string): LaunchFile{
            if(this.checkFileType(filename) == LaunchFileTypes.Link){
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
    run(entry:string){

        // Split with spaces if using query
        let queryArg:string
        let fileName = entry

        console.log(this.isQuerySearch(entry))

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

        this.run('g: '+entry)
        return
    }

    search(term:string):string[] {
        let links = this.files
        .filter(x => x instanceof LaunchLink)
        .map(x => x.toString())
        .filter(x => x.match(term));

        return links
    }

    isQuerySearch(term:string):boolean{
        // Build bang from search term if exists
        let bang = term.split(':')[0]+':'

        let links = this.files
        .filter(x => x instanceof LaunchQuery)
        .map(x => x.toString());

        for(let i = 0; i < links.length; i++){
            if(links[i]){
                return true
            }
        }

        return false
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

    private shortHand:string
    private link:string

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