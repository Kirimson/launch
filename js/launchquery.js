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
        execute(args) {
            let newLoc;
            // If this is a multi arg query file
            if (this.link.includes('${1}')) {
                let splitArgs = args.split(" ");
                newLoc = this.link;
                for (let i = 0; i < splitArgs.length; i++) {
                    let arg = splitArgs[i];
                    newLoc = newLoc.replace(`\${${i + 1}}`, arg);
                }
            }
            else {
                let encodedargs = encodeURIComponent(args).replace(/%20/g, "+");
                newLoc = this.link.replaceAll('${}', encodedargs);
            }
            newLoc = helpers_1.Helper.ensureHttp(newLoc);
            window.location.href = newLoc;
        }
        toString() {
            return this.shortHand;
        }
    }
    exports.LaunchQuery = LaunchQuery;
});
