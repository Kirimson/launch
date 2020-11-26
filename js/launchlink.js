define(["require", "exports", "./launchfile"], function (require, exports, launchfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LaunchLink = void 0;
    class LaunchLink extends launchfile_1.LaunchFile {
        constructor(filename, content, hits, parentId, parentName) {
            super(filename, content, hits, parentId, parentName);
            this.filename = filename;
            this.content = content;
            this.hits = hits;
            this.parentId = parentId;
            this.parentName = parentName;
            this.extension = '.lnk';
        }
        execute() {
            console.log(this.content);
            window.location.href = this.content;
        }
        toString() {
            return this.getLocation().slice(0, -4);
        }
    }
    exports.LaunchLink = LaunchLink;
});
