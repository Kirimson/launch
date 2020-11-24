define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LaunchFolder = void 0;
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
