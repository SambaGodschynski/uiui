import * as vscode from 'vscode';
import { getUiUiView } from './UiUiView';

export class FileWatcher extends vscode.Disposable {
    onDidDocumentSaveDisposable: vscode.Disposable;
    constructor() {
        super(() => {
            this.doDispose();
        });
        this.onDidDocumentSaveDisposable = vscode.workspace.onDidSaveTextDocument((doc: vscode.TextDocument) => {
            if (!doc.fileName) {
                return;
            }
            const view = getUiUiView(doc.fileName);
            if (!view) {
                return;
            }
            view.sourceChanged();
        });
    }

    private doDispose() {
        if (this.onDidDocumentSaveDisposable) {
            this.onDidDocumentSaveDisposable.dispose();
        }
    }

}