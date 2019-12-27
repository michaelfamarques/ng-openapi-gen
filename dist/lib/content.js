"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gen_utils_1 = require("./gen-utils");
/**
 * Either a request body or response content
 */
class Content {
    constructor(mediaType, spec, options) {
        this.mediaType = mediaType;
        this.spec = spec;
        this.options = options;
        this.type = gen_utils_1.tsType(spec.schema, options);
    }
}
exports.Content = Content;
//# sourceMappingURL=content.js.map