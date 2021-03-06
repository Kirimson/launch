export class LaunchFile {   
    // ID number of folder is used, to avoid cyclic references that cannot
    // be serialised easily
    constructor(public filename:string, 
        public content:string, public hits:number, public parentId?:number, 
        public parentName?:string){}
        public extension:string;

    getLocation():string {
        if(this.parentName){
            return `${this.parentName}/${this.filename}`;
        } else return `${this.filename}`;
    }

    addExtension(fileName:string, extension:string){
        // Add extension if not there
        if(fileName.substr(fileName.length - 4, 4) != extension){
            return `${fileName}${extension}`;
        }
        return fileName;
    }
    
    rename(newName:string) {
        this.filename = this.addExtension(newName, this.extension);
    }

    move(parentId:number, parentName:string){
        this.parentId = parentId;
        this.parentName = parentName;
    }

    // Overrriden functions
    execute(args?:string){}
    toString():string{return '';}
}