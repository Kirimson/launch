import { LaunchFile } from "./launchfile";
import { Helper } from "./helpers";

export class LaunchQuery extends LaunchFile{

    public shortHand:string
    public link:string

    constructor(public filename:string,
        public content:string, public hits:number, public parentId?:number, 
        public parentName?:string){
            super(filename, content, hits, parentId, parentName);

            this.shortHand = content.substr(0,content.indexOf(' '));
            // If file was made without : add it
            if(this.shortHand.endsWith(':') == false){
                this.shortHand = this.shortHand + ":";
            }
            this.link = content.substr(content.indexOf(' ')+1);
            this.extension = '.qry';
        }
    
    execute(queryArg:string){
        let newLoc:string = this.link.replace('${}', queryArg)
        newLoc = Helper.ensureHttp(newLoc)
        window.location.href = newLoc;
    }

    toString():string {
        return this.shortHand;
    }
}