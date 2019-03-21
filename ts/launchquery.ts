import { LaunchFile } from "./launchfile";

export class LaunchQuery extends LaunchFile{

    public shortHand:string
    public link:string

    constructor(public filename:string,
        public content:string, public parentId?:number, 
        public parentName?:string){
            super(filename, content, parentId, parentName)

            this.shortHand = content.substr(0,content.indexOf(' '));
            this.link = content.substr(content.indexOf(' ')+1);
            this.extension = '.qry';
        }
    
    execute(queryArg:string){
        window.location.href = this.link.replace('${}', queryArg);
    }

    toString():string {
        return this.shortHand;
    }
}