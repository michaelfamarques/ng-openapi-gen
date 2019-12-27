"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const content_1 = require("./content");
const gen_utils_1 = require("./gen-utils");
const operation_variant_1 = require("./operation-variant");
const parameter_1 = require("./parameter");
const security_1 = require("./security");
const request_body_1 = require("./request-body");
const response_1 = require("./response");
/**
 * An operation descriptor
 */
class Operation {
    constructor(openApi, path, pathSpec, method, id, spec, options) {
        this.openApi = openApi;
        this.path = path;
        this.pathSpec = pathSpec;
        this.method = method;
        this.id = id;
        this.spec = spec;
        this.options = options;
        this.parameters = [];
        this.parametersRequired = false;
        this.security = [];
        this.allResponses = [];
        this.variants = [];
        this.path = this.path.replace(/\'/g, '\\\'');
        this.tags = spec.tags || [];
        this.tsComments = gen_utils_1.tsComments(spec.description || '', 1);
        this.pathVar = `${lodash_1.upperFirst(id)}Path`;
        this.methodName = spec['x-operation-name'] || this.id;
        // Add both the common and specific parameters
        this.parameters = [
            ...this.collectParameters(pathSpec.parameters),
            ...this.collectParameters(spec.parameters),
        ];
        if (this.parameters.find(p => p.required)) {
            this.parametersRequired = true;
        }
        this.hasParameters = this.parameters.length > 0;
        this.security = spec.security ? this.collectSecurity(spec.security) : this.collectSecurity(openApi.security);
        let body = spec.requestBody;
        if (body) {
            if (body.$ref) {
                body = gen_utils_1.resolveRef(this.openApi, body.$ref);
            }
            body = body;
            this.requestBody = new request_body_1.RequestBody(body, this.collectContent(body.content), this.options);
            if (body.required) {
                this.parametersRequired = true;
            }
        }
        const responses = this.collectResponses();
        this.successResponse = responses.success;
        this.allResponses = responses.all;
        this.pathExpression = this.toPathExpression();
        // Now calculate the variants: request body content x success response content
        this.calculateVariants();
    }
    collectParameters(params) {
        const result = [];
        if (params) {
            for (let param of params) {
                if (param.$ref) {
                    param = gen_utils_1.resolveRef(this.openApi, param.$ref);
                }
                param = param;
                if (param.in === 'cookie') {
                    console.warn(`Ignoring cookie parameter ${this.id}.${param.name} as cookie parameters cannot be sent in XmlHttpRequests.`);
                }
                else if (this.paramIsNotExcluded(param)) {
                    result.push(new parameter_1.Parameter(param, this.options));
                }
            }
        }
        return result;
    }
    collectSecurity(params) {
        if (!params) {
            return [];
        }
        return params.map((param) => {
            return Object.keys(param).map(key => {
                const scope = param[key];
                const security = gen_utils_1.resolveRef(this.openApi, `#/components/securitySchemes/${key}`);
                return new security_1.Security(key, security, scope, this.options);
            });
        });
    }
    paramIsNotExcluded(param) {
        const excludedParameters = this.options.excludeParameters || [];
        return !excludedParameters.includes(param.name);
    }
    collectContent(desc) {
        const result = [];
        if (desc) {
            for (const type of Object.keys(desc)) {
                result.push(new content_1.Content(type, desc[type], this.options));
            }
        }
        return result;
    }
    collectResponses() {
        let successResponse = undefined;
        const allResponses = [];
        const responses = this.spec.responses || {};
        for (const statusCode of Object.keys(responses)) {
            const responseDesc = responses[statusCode];
            const response = new response_1.Response(statusCode, responseDesc.description || '', this.collectContent(responseDesc.content), this.options);
            allResponses.push(response);
            const statusInt = Number.parseInt(statusCode.trim(), 10);
            if (!successResponse && statusInt >= 200 && statusInt < 300) {
                successResponse = response;
            }
        }
        return { success: successResponse, all: allResponses };
    }
    /**
     * Returns a path expression to be evaluated, for example:
     * "/a/{var1}/b/{var2}/" returns "/a/${params.var1}/b/${params.var2}"
     */
    toPathExpression() {
        return (this.path || '').replace(/\{([^}]+)}/g, (_, pName) => {
            const param = this.parameters.find(p => p.name === pName);
            const paramName = param ? param.var : pName;
            return '${params.' + paramName + '}';
        });
    }
    calculateVariants() {
        const hasRequestBodyVariants = this.requestBody && this.requestBody.content.length > 1;
        const hasResponseVariants = this.successResponse && this.successResponse.content.length > 1;
        const contentOrNull = (hasContent) => {
            if (hasContent) {
                const content = hasContent.content;
                if (content && content.length > 0) {
                    return content;
                }
            }
            return [null];
        };
        const requestBodyVariants = contentOrNull(this.requestBody);
        const successResponseVariants = contentOrNull(this.successResponse);
        for (const requestBodyVariant of requestBodyVariants) {
            const methodPart = this.methodName + (hasRequestBodyVariants ? this.variantMethodPart(requestBodyVariant) : '');
            for (const successResponseVariant of successResponseVariants) {
                const methodName = methodPart + (hasResponseVariants ? this.variantMethodPart(successResponseVariant) : '');
                if (!this.variants.find(v => v.methodName === methodName)) {
                    // It is possible to have multiple content types which end up in the same method.
                    // For example: application/json, application/foo-bar+json, text/json ...
                    this.variants.push(new operation_variant_1.OperationVariant(this, methodName, requestBodyVariant, successResponseVariant, this.options));
                }
            }
        }
    }
    /**
     * Returns how the given content is represented on the method name
     */
    variantMethodPart(content) {
        if (content) {
            let type = content.mediaType.replace(/\/\*/, '');
            if (type === '*' || type === 'application/octet-stream') {
                return '$Any';
            }
            type = lodash_1.last(type.split('/'));
            const plus = type.lastIndexOf('+');
            if (plus >= 0) {
                type = type.substr(plus + 1);
            }
            return `$${gen_utils_1.typeName(type)}`;
        }
        else {
            return '';
        }
    }
}
exports.Operation = Operation;
//# sourceMappingURL=operation.js.map