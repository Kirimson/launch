define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LaunchFolder {
        constructor(folderName, folderid, readOnly = false) {
            this.id = folderid;
            this.name = folderName;
            this.readOnly = readOnly;
        }
        rename(newName) {
            this.name = newName;
        }
        isReadOnly() {
            return this.readOnly;
        }
        setReadOnly(readOnly) {
            this.readOnly = readOnly;
        }
    }
    exports.LaunchFolder = LaunchFolder;
});
