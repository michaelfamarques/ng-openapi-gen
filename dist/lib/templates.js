"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const Handlebars = __importStar(require("handlebars"));
const path_1 = __importDefault(require("path"));
/**
 * Holds all templates, and know how to apply them
 */
class Templates {
    constructor(builtInDir, customDir) {
        this.templates = {};
        this.globals = {};
        const builtInTemplates = fs_1.default.readdirSync(builtInDir);
        const customTemplates = customDir === '' ? [] : fs_1.default.readdirSync(customDir);
        // Read all built-in templates, but taking into account an override, if any
        for (const file of builtInTemplates) {
            const dir = customTemplates.includes(file) ? customDir : builtInDir;
            this.parseTemplate(dir, file);
        }
        // Also read any custom templates which are not built-in
        for (const file of customTemplates) {
            this.parseTemplate(customDir, file);
        }
    }
    parseTemplate(dir, file) {
        const baseName = this.baseName(file);
        if (baseName) {
            const text = fs_1.default.readFileSync(path_1.default.join(dir, file), 'utf-8');
            const compiled = Handlebars.compile(text);
            this.templates[baseName] = compiled;
            Handlebars.registerPartial(baseName, compiled);
        }
    }
    /**
     * Sets a global variable, that is, added to the model of all templates
     */
    setGlobals(globals) {
        for (const name of Object.keys(globals)) {
            const value = globals[name];
            this.globals[name] = value;
        }
    }
    baseName(file) {
        if (!file.endsWith('.handlebars')) {
            return null;
        }
        return file.substring(0, file.length - '.handlebars'.length);
    }
    /**
     * Applies a template with a given model
     * @param templateName The template name (file without .handlebars extension)
     * @param model The model variables to be passed in to the template
     */
    apply(templateName, model) {
        const template = this.templates[templateName];
        if (!template) {
            throw new Error(`Template not found: ${templateName}`);
        }
        const actualModel = Object.assign(Object.assign({}, this.globals), (model || {}));
        return template(actualModel);
    }
}
exports.Templates = Templates;
//# sourceMappingURL=templates.js.map