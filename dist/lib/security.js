"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gen_utils_1 = require("./gen-utils");
/**
 * An operation security
 */
class Security {
    constructor(key, spec, scope = [], options) {
        this.spec = spec;
        this.scope = scope;
        this.name = spec.name || '';
        this.var = gen_utils_1.methodName(key);
        this.tsComments = gen_utils_1.tsComments(spec.description || '', 2);
        this.in = spec.in || 'header';
        this.type = gen_utils_1.tsType(spec.schema, options);
    }
}
exports.Security = Security;
//# sourceMappingURL=security.js.map