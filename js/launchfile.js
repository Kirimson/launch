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
                return `${this.parentName}/${this.filename}`;
            }
            else
                return `${this.filename}`;
        }
        addExtension(fileName, extension) {
            // Add extension if not there
            if (fileName.substr(fileName.length - 4, 4) != extension) {
                return `${fileName}${extension}`;
            }
            return fileName;
        }
        rename(newName) {
            this.filename = this.addExtension(newName, this.extension);
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
