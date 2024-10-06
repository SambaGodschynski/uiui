import { writeFileSync } from "fs";
import { IUiUiElementDef, IUiUiRootDef } from "./UiUiDefs";
import * as _ from 'lodash';

const WriteDelayMillis = 500;
const VariableEscapeChar = '#';

export type RendererValueType = string | number | boolean;
export class Renderer {
    private uiuiRoot: IUiUiRootDef;
    private renderExpessions: string[] = [];
    private values: { [key: string]: RendererValueType } = {};
    private write: () => void;
    constructor(jsonText: string) {
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
    findRenderExpressions(def: IUiUiElementDef) {
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
    valueChanged(id: string, value: RendererValueType) {
        if (!id) {
            return;
        }
        this.values[id] = value;
        this.write();
    }
    writeDebounced() {
        const lines: string[] = [];
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
        writeFileSync(this.uiuiRoot.outfile, lines.join('\n'), { flag: 'w' })
        
    }
}