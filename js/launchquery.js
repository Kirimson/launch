define(["require", "exports", "./launchfile", "./helpers"], function (require, exports, launchfile_1, helpers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LaunchQuery = void 0;
    class LaunchQuery extends launchfile_1.LaunchFile {
        constructor(filename, content, hits, parentId, parentName) {
            super(filename, content, hits, parentId, parentName);
            this.filename = filename;
            this.content = content;
            this.hits = hits;
            this.parentId = parentId;
            this.parentName = parentName;
            this.shortHand = content.substr(0, content.indexOf(' '));
            // If file was made without : add it
            if (this.shortHand.endsWith(':') == false) {
                this.shortHand = this.shortHand + ":";
            }
            this.link = content.substr(content.indexOf(' ') + 1);
            this.extension = '.qry';
        }
        execute(queryArg) {
            let newLoc = this.link.replace('${}', queryArg);
            newLoc = helpers_1.Helper.ensureHttp(newLoc);
            window.location.href = newLoc;
        }
        toString() {
            return this.shortHand;
        }
    }
    exports.LaunchQuery = LaunchQuery;
});
