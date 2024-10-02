import * as vscode from 'vscode';

export class FileWatcher extends vscode.Disposable {
    //onDidDocumentSaveDisposable: vscode.Disposable;
    constructor() {
        super(() => {
            // this.doDispose();
        });
       // this.onDidDocumentSaveDisposable = vscode.workspace.onDidSaveTextDocument(this.checkCurrentSheetForErrors.bind(this));
    }

    // private doDispose() {
    //     if (this.onDidDocumentSaveDisposable) {
    //         this.onDidDocumentSaveDisposable.dispose();
    //     }
    // }

}