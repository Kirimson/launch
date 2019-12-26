define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LaunchFolder {
        constructor(folderName, folderid) {
            this.id = folderid;
            this.name = folderName;
        }
        rename(newName) {
            this.name = newName;
        }
    }
    exports.LaunchFolder = LaunchFolder;
});
