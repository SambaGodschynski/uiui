"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const UiUiView_1 = require("./UiUiView");
class FileWatcher extends vscode.Disposable {
    constructor() {
        super(() => {
            this.doDispose();
        });
        this.onDidDocumentSaveDisposable = vscode.workspace.onDidSaveTextDocument((doc) => {
            if (!doc.fileName) {
                return;
            }
            const view = UiUiView_1.getUiUiView(doc.fileName);
            if (!view) {
                return;
            }
            view.sourceChanged();
        });
    }
    doDispose() {
        if (this.onDidDocumentSaveDisposable) {
            this.onDidDocumentSaveDisposable.dispose();
        }
    }
}
exports.FileWatcher = FileWatcher;
//# sourceMappingURL=FileWatcher.js.map