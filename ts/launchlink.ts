import { LaunchFile } from "./launchfile";

export class LaunchLink extends LaunchFile {
    
    constructor(public filename:string, 
        public content:string, public hits:number, public parentId?:number, 
        public parentName?:string){
            super(filename, content, hits, parentId, parentName);
            this.extension = '.lnk';
        }

    execute() {
        window.location.href = this.content;
    }

    toString():string {
        return this.getLocation().slice(0,-4);
    }
}