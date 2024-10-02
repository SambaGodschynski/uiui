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
const ACommand_1 = require("./ACommand");
const vscode = require("vscode");
const InspectorView_1 = require("../com/InspectorView");
class RevealInDebugView extends ACommand_1.ACommand {
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentEditor = vscode.window.activeTextEditor;
            if (!currentEditor) {
                return;
            }
            const cursorPos = currentEditor.selection.start;
            const cursorOffset = currentEditor.document.offsetAt(cursorPos);
            yield InspectorView_1.InspectorView.reveal(currentEditor.document.uri.fsPath, cursorOffset);
        });
    }
}
exports.RevealInDebugView = RevealInDebugView;
//# sourceMappingURL=RevealInDebugView.js.map