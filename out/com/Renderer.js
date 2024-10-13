"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const _ = require("lodash");
const path = require("path");
const WriteDelayMillis = 500;
const VariableEscapeChar = '#';
class Renderer {
    constructor(jsonText, basePath) {
        this.basePath = basePath;
        this.renderExpessions = [];
        this.values = {};
        this.unprocessedValues = {};
        this.uiuiRoot = JSON.parse(jsonText);
        this.write = _.debounce(this.writeDebounced.bind(this), WriteDelayMillis);
        this.findRenderExpressions(this.uiuiRoot);
        if (!this.uiuiRoot.outfile) {
            throw new Error(`missing "outfile"`);
        }
        if (!this.lineCommentChar) {
            throw new Error(`missing "line-comment-char" attribute`);
        }
        this.readValues();
    }
    get lineCommentChar() {
        return this.uiuiRoot["line-comment-char"];
    }
    get outPath() {
        return path.join(this.basePath, this.uiuiRoot.outfile);
    }
    get templatePath() {
        if (!this.uiuiRoot.template) {
            throw new Error(`missing template path`);
        }
        return path.join(this.basePath, this.uiuiRoot.template);
    }
    readValues() {
        if (!fs_1.existsSync(this.outPath)) {
            return;
        }
        const re = new RegExp(`\\s*${this.lineCommentChar}\\s*uiui\\s*([A-Za-z0-9+/=]+)\\s*$`, "m");
        const text = fs_1.readFileSync(this.outPath).toString();
        if (!text) {
            console.error("no file content");
            return;
        }
        const match = text.match(re);
        if (!match || !match[1]) {
            console.error("no match");
            return;
        }
        const jsonString = Buffer.from(match[1], 'base64').toString('utf-8');
        this.values = JSON.parse(jsonString);
    }
    findRenderExpressions(def) {
        if (def.render) {
            const placeholder = def.placeholder;
            const expr = def.render;
            if (this.uiuiRoot.template && !placeholder) {
                throw new Error(`missing "placeholder" for "${def.id || 'unkown id'}. If you use a template you need to define a placeholder for every render expression."`);
            }
            this.renderExpessions.push({ expr, placeholder });
        }
        if (!def.children) {
            return;
        }
        for (const child of def.children) {
            this.findRenderExpressions(child);
        }
    }
    valueChanged(msg) {
        if (!msg || !msg.id) {
            return;
        }
        this.values[msg.id] = msg.eventData.value;
        this.unprocessedValues[msg.id] = msg.eventData.originalValue || msg.eventData.value;
        this.write();
    }
    valueDump() {
        const valuesJson = JSON.stringify(this.unprocessedValues);
        const base64Encoded = Buffer.from(valuesJson).toString('base64');
        return `${this.lineCommentChar} uiui ${base64Encoded}`;
    }
    writeDebounced() {
        const placeholderMap = {};
        const lines = [];
        const isRenderingTemplate = !!this.uiuiRoot.template;
        let addExprLine = (expr, placeholder) => {
            lines.push(`${expr}`);
        };
        if (isRenderingTemplate) {
            addExprLine = (expr, placeholder) => {
                if (!placeholder) {
                    return;
                }
                const exprs = placeholderMap[placeholder] || [];
                exprs.push(expr);
                placeholderMap[placeholder] = exprs;
            };
        }
        for (let { expr, placeholder } of this.renderExpessions) {
            for (const id in this.values) {
                const value = this.values[id];
                const regex = new RegExp(`${VariableEscapeChar}${id}`, "g");
                const match = expr.match(regex);
                if (!match) {
                    continue;
                }
                expr = expr.replace(regex, `${value}`);
            }
            addExprLine(expr, placeholder);
        }
        if (!isRenderingTemplate) {
            lines.push(this.valueDump());
            fs_1.writeFileSync(this.outPath, lines.join('\n'), { flag: 'w' });
            return;
        }
        let templateText = fs_1.readFileSync(this.templatePath).toString();
        for (let placeholder in placeholderMap) {
            const exprs = placeholderMap[placeholder];
            placeholder = placeholder.replace(/([$<>\[\]^.])/g, '\\$1');
            templateText = templateText.replace(new RegExp(placeholder, "g"), exprs.join('\n'));
        }
        templateText += `\n${this.valueDump()}\n`;
        fs_1.writeFileSync(this.outPath, templateText, { flag: 'w' });
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=Renderer.js.map