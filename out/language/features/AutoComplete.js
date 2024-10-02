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
class AutoComplete {
    constructor(languageFeatures) {
        this.languageFeatures = languageFeatures;
    }
    createItem(suggestion, index) {
        const item = new vscode.CompletionItem(suggestion.displayText);
        const OrderOffsetToCompensateLexicographicOrdering = 10000000;
        item.insertText = suggestion.text;
        if (suggestion.parameter) {
            // is parameter suggestion
            item.filterText = suggestion.displayText;
        }
        else {
            item.filterText = suggestion.text;
        }
        const markdownString = new vscode.MarkdownString();
        const url = suggestion.url;
        const description = suggestion.description || "";
        const title = url ? `[${suggestion.displayText}](${url})` : suggestion.displayText;
        const markdownText = `### ${title}
${description}`;
        markdownString.appendMarkdown(markdownText);
        item.documentation = markdownString;
        item.sortText = (index + OrderOffsetToCompensateLexicographicOrdering).toString();
        item.kind = vscode.CompletionItemKind.Value;
        if (suggestion.file) {
            const pathSuggestion = suggestion;
            item.kind = pathSuggestion.file.isDirectory ? vscode.CompletionItemKind.Folder : vscode.CompletionItemKind.File;
        }
        if (suggestion.command) {
            const commandSuggestion = suggestion;
            item.kind = commandSuggestion.parameter === null ? vscode.CompletionItemKind.Variable : vscode.CompletionItemKind.Value;
        }
        if (suggestion.deprecated) {
            item.detail = "deprecated: " + suggestion.deprecated;
            item.tags = [1]; // why that hack? how to set properly?
        }
        return item;
    }
    complete(document, position, token, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = new SourceDocument_1.ActiveSourceDocument(document, position);
            try {
                const suggestions = yield this.languageFeatures.autoComplete(doc);
                const items = suggestions.map((suggestion, index) => this.createItem(suggestion, index));
                return items;
            }
            catch (ex) {
                console.error("werckmeister suggestions error", ex);
                return [];
            }
        });
    }
}
exports.AutoComplete = AutoComplete;
//# sourceMappingURL=AutoComplete.js.map