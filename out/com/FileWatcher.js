"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class FileWatcher extends vscode.Disposable {
    //onDidDocumentSaveDisposable: vscode.Disposable;
    constructor() {
        super(() => {
            // this.doDispose();
        });
        // this.onDidDocumentSaveDisposable = vscode.workspace.onDidSaveTextDocument(this.checkCurrentSheetForErrors.bind(this));
    }
}
exports.FileWatcher = FileWatcher;
//# sourceMappingURL=FileWatcher.js.map