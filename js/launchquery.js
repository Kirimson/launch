define(["require", "exports", "./launchfile"], function (require, exports, launchfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LaunchQuery = void 0;
    class LaunchQuery extends launchfile_1.LaunchFile {
        constructor(filename, content, parentId, parentName) {
            super(filename, content, parentId, parentName);
            this.filename = filename;
            this.content = content;
            this.parentId = parentId;
            this.parentName = parentName;
            this.shortHand = content.substr(0, content.indexOf(' '));
            this.link = content.substr(content.indexOf(' ') + 1);
            this.extension = '.qry';
        }
        execute(queryArg) {
            window.location.href = this.link.replace('${}', queryArg);
        }
        toString() {
            return this.shortHand;
        }
    }
    exports.LaunchQuery = LaunchQuery;
});
