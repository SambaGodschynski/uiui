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
            const processedIds = [];
            for (const id in this.values) {
                const value = this.values[id];
                const regex = new RegExp(`${VariableEscapeChar}${id}`, "g");
                const match = expr.match(regex);
                if (!match) {
                    continue;
                }
                processedIds.push(id);
                expr = expr.replace(regex, `${value}`);
            }
            lines.push(`${this.uiuiRoot.comment} uiui ${VariableEscapeChar}${processedIds.join(', ')}`);
            lines.push(`${expr}`);
        }
        fs_1.writeFileSync(this.uiuiRoot.outfile, lines.join('\n'), { flag: 'w' });
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=Renderer.js.map