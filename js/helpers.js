define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Helper = void 0;
    class Helper {
        /**
         * Checks if text contains http, if not, prepend it
         * @param text text to check
         */
        static ensureHttp(text) {
            let pattern = /(http(s)?:\/\/.).*/g;
            if (text.match(pattern)) {
                return text;
            }
            return 'http://' + text;
        }
    }
    exports.Helper = Helper;
});
