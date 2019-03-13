define(["require", "exports", "./launchfile"], function (require, exports, launchfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LaunchLink extends launchfile_1.LaunchFile {
        constructor(filename, content, parentId, parentName) {
            super(filename, content, parentId, parentName);
            this.filename = filename;
            this.content = content;
            this.parentId = parentId;
            this.parentName = parentName;
        }
        execute() {
            window.location.href = this.content;
        }
        toString() {
            return this.getLocation().slice(0, -4);
        }
    }
    exports.LaunchLink = LaunchLink;
});