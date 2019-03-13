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