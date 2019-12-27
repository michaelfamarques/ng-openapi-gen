"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gen_utils_1 = require("./gen-utils");
/**
 * An operation parameter
 */
class Parameter {
    constructor(spec, options) {
        this.spec = spec;
        this.name = spec.name;
        this.var = gen_utils_1.methodName(this.name);
        this.tsComments = gen_utils_1.tsComments(spec.description || '', 2);
        this.in = spec.in || 'query';
        this.required = this.in === 'path' || spec.required || false;
        this.type = gen_utils_1.tsType(spec.schema, options);
    }
}
exports.Parameter = Parameter;
//# sourceMappingURL=parameter.js.map