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
const vscode = require("vscode");
const SourceDocument_1 = require("./impl/SourceDocument");
require("regenerator-runtime/runtime");
class HoverInfo {
    constructor(languageFeatures) {
        this.languageFeatures = languageFeatures;
    }
    get(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = new SourceDocument_1.ActiveSourceDocument(document, position);
            const wordAtPosition = document.getText(document.getWordRangeAtPosition(position));
            try {
                const suggestions = yield this.languageFeatures.autoComplete(doc);
                const suggestionItem = suggestions.find(x => x.text === wordAtPosition);
                if (!suggestionItem || !suggestionItem.description) {
                    return null;
                }
                return new vscode.Hover(suggestionItem.description);
            }
            catch (ex) {
                console.error("werckmeister hover info error", ex);
                return null;
            }
        });
    }
}
exports.HoverInfo = HoverInfo;
//# sourceMappingURL=HoverInfo.js.map