"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const _ = require("lodash");
const WriteDelayMillis = 1000;
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
    writeDebounced() {
        const lines = [];
        for (let expr of this.renderExpessions) {
            for (const id in this.values) {
                const value = this.values[id];
                expr = expr.replace(new RegExp(`$${id}`, "g"), `${value}`);
                lines.push(expr);
            }
        }
        fs_1.writeFileSync(this.uiuiRoot.outfile, lines.join('\n'), { flag: 'w' });
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=Renderer.js.map