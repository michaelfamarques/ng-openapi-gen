"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gen_utils_1 = require("./gen-utils");
/**
 * Describes a request body
 */
class RequestBody {
    constructor(spec, content, options) {
        this.spec = spec;
        this.content = content;
        this.options = options;
        this.tsComments = gen_utils_1.tsComments(spec.description, 1);
        this.required = spec.required === true;
    }
}
exports.RequestBody = RequestBody;
//# sourceMappingURL=request-body.js.map