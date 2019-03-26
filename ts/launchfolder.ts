export class LaunchFolder {
    public id:number;
    public name:string;

    constructor(folderName:string, folderid:number){
        this.id = folderid;
        this.name = folderName;
    }

    rename(newName:string){
        this.name = newName;
    }
}
