"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gen_utils_1 = require("./gen-utils");
/**
 * An operation has a variant per distinct possible body content
 */
class OperationVariant {
    constructor(operation, methodName, requestBody, successResponse, options) {
        this.operation = operation;
        this.methodName = methodName;
        this.requestBody = requestBody;
        this.successResponse = successResponse;
        this.options = options;
        this.responseMethodName = `${methodName}$Response`;
        if (successResponse) {
            this.resultType = successResponse.type;
            this.responseType = this.inferResponseType(successResponse.mediaType);
            this.accept = successResponse.mediaType;
        }
        else {
            this.resultType = 'void';
            this.responseType = 'text';
            this.accept = '*/*';
        }
        this.isVoid = this.resultType === 'void';
        this.isNumber = this.resultType === 'number';
        this.isBoolean = this.resultType === 'boolean';
        this.isOther = !this.isVoid && !this.isNumber && !this.isBoolean;
        let description = (operation.spec.description || '').trim();
        if (description !== '') {
            description += '\n\n';
        }
        this.responseMethodTsComments = gen_utils_1.tsComments(this.responseMethodDescription(), 1);
        this.bodyMethodTsComments = gen_utils_1.tsComments(this.bodyMethodDescription(), 1);
    }
    inferResponseType(mediaType) {
        mediaType = mediaType.toLowerCase();
        if (mediaType === 'application/json' || mediaType.startsWith('application/') && mediaType.endsWith('+json')) {
            return 'json';
        }
        else if (mediaType.startsWith('text/')) {
            return 'text';
        }
        else {
            return 'blob';
        }
    }
    responseMethodDescription() {
        return `${this.descriptionPrefix()}This method provides access to the full \`HttpResponse\`, allowing access to response headers.
To access only the response body, use \`${this.methodName}()\` instead.${this.descriptionSuffix()}`;
    }
    bodyMethodDescription() {
        return `${this.descriptionPrefix()}This method provides access to only to the response body.
To access the full response (for headers, for example), \`${this.responseMethodName}()\` instead.${this.descriptionSuffix()}`;
    }
    descriptionPrefix() {
        let description = (this.operation.spec.description || '').trim();
        if (description !== '') {
            description += '\n\n';
        }
        return description;
    }
    descriptionSuffix() {
        const sends = this.requestBody ? 'sends `' + this.requestBody.mediaType + '` and ' : '';
        const handles = this.requestBody
            ? `handles request body of type \`${this.requestBody.mediaType}\``
            : 'doesn\'t expect any request body';
        return `\n\nThis method ${sends}${handles}.`;
    }
}
exports.OperationVariant = OperationVariant;
//# sourceMappingURL=operation-variant.js.map