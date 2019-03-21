define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LaunchFile {
        // ID number of folder is used, to avoid cyclic references that cannot
        // be serialised easily
        constructor(filename, content, parentId, parentName) {
            this.filename = filename;
            this.content = content;
            this.parentId = parentId;
            this.parentName = parentName;
        }
        getLocation() {
            if (this.parentName) {
                return this.parentName + '/' + this.filename;
            }
            else
                return this.filename;
        }
        rename(newName) {
            this.filename = newName;
        }
        move(parentId, parentName) {
            this.parentId = parentId;
            this.parentName = parentName;
        }
        // Overrriden functions
        execute(queryArg) { }
        toString() { return ''; }
    }
    exports.LaunchFile = LaunchFile;
});
