import { writeFileSync, readFileSync, existsSync } from "fs";
import { IUiUiElementDef, IUiUiRootDef } from "./UiUiDefs";
import * as _ from 'lodash';
import * as path from 'path';

const WriteDelayMillis = 500;
const VariableEscapeChar = '#';

export type RendererValueType = string | number | boolean;
export class Renderer {
    private uiuiRoot: IUiUiRootDef;
    private renderExpessions: string[] = [];
    public values: { [key: string]: RendererValueType } = {};
    private write: () => void;
    constructor(jsonText: string, private basePath: string) {
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

    get outPath(): string {
        return path.join(this.basePath, this.uiuiRoot.outfile);
    }

    readValues(): void {
        if (!existsSync(this.outPath)) {
            return;
        }
        const re = new RegExp(`\\s*${this.uiuiRoot.comment}\\s*uiui\\s*([A-Za-z0-9+/=]+)\\s*$`, "m");
        const text = readFileSync(this.outPath).toString();
        if (!text) {
            console.error("no file content");
            return;
        }
        const match = text.match(re);
        if (!match || !match[1]) {
            console.error("no match")
            return;
        }
        const jsonString = Buffer.from(match[1], 'base64').toString('utf-8');
        this.values = JSON.parse(jsonString);
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

    valueDump():string {
        const valuesJson = JSON.stringify(this.values);
        const base64Encoded = Buffer.from(valuesJson).toString('base64');
        return `${this.uiuiRoot.comment} uiui ${base64Encoded}`;
    }

    writeDebounced() {
        const lines: string[] = [];
        for (let expr of this.renderExpessions) {
            const processedValues:{id: string, value: any}[] = [];
            for (const id in this.values) {
                const value = this.values[id];
                const regex = new RegExp(`${VariableEscapeChar}${id}`, "g");
                const match = expr.match(regex);
                if (!match) {
                    continue;
                }
                processedValues.push({id, value});
                expr = expr.replace(regex, `${value}`);
            }
            lines.push(`${expr}`);
        }
        lines.push(this.valueDump());
        writeFileSync(this.outPath, lines.join('\n'), { flag: 'w' })
    }
}