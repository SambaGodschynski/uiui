"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const _ = require("lodash");
const WriteDelayMillis = 500;
const VariableEscapeChar = '#';
class Renderer {
    constructor(jsonText) {
        this.renderExpessions = [];
        this.values = {};
        this.uiuiRoot = JSON.parse(jsonText);
        this.write = _.debounce(this.writeDebounced.bind(this), WriteDelayMillis);
        this.findRenderExpressions(this.uiuiRoot);
        if (!this.uiuiRoot.outfile) {
            throw new Error(`missing "outfile"`);
        }
        if (!this.uiuiRoot.comment) {
            throw new Error(`missing comment attribute`);
        }
        this.readValues();
    }
    readValues() {
        if (!fs_1.existsSync(this.uiuiRoot.outfile)) {
            return;
        }
        const re = new RegExp(`\\s*${this.uiuiRoot.comment}\\s*uiui\\s*([A-Za-z0-9+/=]+)\\s*$`, "m");
        const text = fs_1.readFileSync(this.uiuiRoot.outfile).toString();
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
            this.renderExpessions.push(def.render);
        }
        if (!def.children) {
            return;
        }
        for (const child of def.children) {
            this.findRenderExpressions(child);
        }
    }
    valueChanged(id, value) {
        if (!id) {
            return;
        }
        this.values[id] = value;
        this.write();
    }
    valueDump() {
        const valuesJson = JSON.stringify(this.values);
        const base64Encoded = Buffer.from(valuesJson).toString('base64');
        return `${this.uiuiRoot.comment} uiui ${base64Encoded}`;
    }
    writeDebounced() {
        const lines = [];
        for (let expr of this.renderExpessions) {
            const processedValues = [];
            for (const id in this.values) {
                const value = this.values[id];
                const regex = new RegExp(`${VariableEscapeChar}${id}`, "g");
                const match = expr.match(regex);
                if (!match) {
                    continue;
                }
                processedValues.push({ id, value });
                expr = expr.replace(regex, `${value}`);
            }
            lines.push(`${expr}`);
        }
        lines.push(this.valueDump());
        fs_1.writeFileSync(this.uiuiRoot.outfile, lines.join('\n'), { flag: 'w' });
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=Renderer.js.map