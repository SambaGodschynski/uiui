"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Play_1 = require("./Play");
const vscode = require("vscode");
const Compiler_1 = require("../com/Compiler");
const fspath = require("path");
const lastSavePaths = {};
class SaveMidi extends Play_1.Play {
    startPlayer(sheetPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastSavePath = lastSavePaths[sheetPath] || null;
            let defaultUri = undefined;
            if (lastSavePath) {
                defaultUri = vscode.Uri.file(lastSavePath);
            }
            const dlgResult = yield vscode.window.showSaveDialog({ defaultUri, filters: { "Midi Files": ["mid", "midi"] } });
            if (!dlgResult || !dlgResult.fsPath) {
                return;
            }
            const path = dlgResult.fsPath;
            lastSavePaths[sheetPath] = path;
            const filename = fspath.basename(path);
            const dirname = fspath.dirname(path);
            try {
                const compiler = new Compiler_1.Compiler();
                yield compiler.compile(sheetPath, Compiler_1.CompilerMode.normal, path);
                vscode.window.showInformationMessage(`saved: ${filename} in ${dirname}`);
            }
            catch (_a) {
                vscode.window.showErrorMessage(`saving midi file: "${path}" failed`);
            }
        });
    }
}
exports.SaveMidi = SaveMidi;
//# sourceMappingURL=SaveMidi.js.map