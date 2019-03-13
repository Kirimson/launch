export class LaunchFolder {
    public id:number;
    public name:string;
    private readOnly:boolean;

    constructor(public folderName:string, folderid:number,
        readOnly:boolean=false){
        this.id = folderid;
        this.name = folderName;
        this.readOnly = readOnly;
    }

    isReadOnly() {
        return this.readOnly;
    }

    setReadOnly(readOnly: boolean): any {
        this.readOnly = readOnly;
    }
}
