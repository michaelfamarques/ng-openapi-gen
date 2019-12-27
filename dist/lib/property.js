"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gen_utils_1 = require("./gen-utils");
/**
 * An object property
 */
class Property {
    constructor(name, schema, required, options) {
        this.name = name;
        this.schema = schema;
        this.required = required;
        this.type = gen_utils_1.tsType(this.schema, options);
        const description = schema.description || '';
        this.tsComments = gen_utils_1.tsComments(description, 1);
    }
}
exports.Property = Property;
//# sourceMappingURL=property.js.map