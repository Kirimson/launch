export class LaunchFolder {
    public id:number;
    public name:string;
    private readOnly:boolean;

    constructor(folderName:string, folderid:number,
        readOnly:boolean=false){
        this.id = folderid;
        this.name = folderName;
        this.readOnly = readOnly;
    }

    rename(newName:string){
        this.name = newName;
    }

    isReadOnly() {
        return this.readOnly;
    }

    setReadOnly(readOnly: boolean): any {
        this.readOnly = readOnly;
    }
}
