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
    
    execute(args:string){
        let newLoc:string;
        // If this is a multi arg query file
        if (this.link.includes('${1}')) {
            let splitArgs = args.split(" ");
            newLoc = this.link;
            for (let i = 0; i < splitArgs.length; i++ ) {
                let arg = splitArgs[i];
                newLoc = newLoc.replace(`\${${i+1}}`, arg)
            }
        } else {
            let encodedargs = encodeURIComponent(args).replace(/%20/g, "+");
            newLoc = this.link.replaceAll('${}', encodedargs)
        }
        newLoc = Helper.ensureHttp(newLoc)
        window.location.href = newLoc;
    }

    toString():string {
        return this.shortHand;
    }
}