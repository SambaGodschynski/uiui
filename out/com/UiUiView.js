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
const fs = require("fs");
const AWebView_1 = require("./AWebView");
const ViewTitle = "UiUi Inspector";
const openedViews = [];
function registerInspector(inspector) {
    openedViews.push(inspector);
}
function unregisterInspector(inspector) {
    const idx = openedViews.indexOf(inspector);
    openedViews.splice(idx, 1);
}
class UiUiView extends AWebView_1.AWebView {
    constructor(context) {
        super(context);
        this.currentPanel = null;
        this.document = null;
        this.onDidDocumentSaveDisposable = null;
        this.onViewReady = () => { };
        this.onViewInitialRendered = () => { };
        this.titleUpdater = null;
        registerInspector(this);
        this.onSourcesChangedBound = this.onSourcesChanged.bind(this);
        this.viewReady = new Promise(resolve => {
            this.onViewReady = resolve;
        });
        this.viewInitialRendered = new Promise(resolve => {
            this.onViewInitialRendered = resolve;
        });
        if (vscode.window.activeTextEditor) {
            this.viewReady.then(() => __awaiter(this, void 0, void 0, function* () {
                this.sendSource();
            }));
        }
    }
    get panel() {
        return this.currentPanel;
    }
    onSourcesChanged() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.currentPanel) {
                return;
            }
            //this.currentPanel.webview.postMessage(message);
        });
    }
    sendSource() {
        if (!this.document) {
            return;
        }
        const source = this.document.getText();
        const message = {
            msg: "updateSouce",
            source: source
        };
        this.currentPanel.webview.postMessage(message);
    }
    onDocumentSaved(document) {
    }
    registerListener() {
        this.onDidDocumentSaveDisposable = vscode.workspace.onDidSaveTextDocument(this.onDocumentSaved.bind(this));
    }
    removeListener() {
        if (this.onDidDocumentSaveDisposable) {
            this.onDidDocumentSaveDisposable.dispose();
        }
    }
    onWebViewMessage(message) {
        switch (message.command) {
            case "uiuiview-ready": return this.onViewReady();
        }
    }
    onWebViewStateChanged(ev) {
    }
    onPanelDidDispose() {
        unregisterInspector(this);
        super.onPanelDidDispose();
        this.removeListener();
    }
    createPanelImpl() {
        return new Promise((resolve, reject) => {
            this.currentPanel = vscode.window.createWebviewPanel('uiui.Inspector', // Identifies the type of the webview. Used internally
            ViewTitle, // Title of the panel displayed to the user
            vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            let jsPath = vscode.Uri.file(this.getExtensionPath('WebViewApp', 'dist', 'WebViewApp.dist.js'));
            let htmlPath = vscode.Uri.file(this.getExtensionPath('WebViewApp', 'inspector.html'));
            this.currentPanel.webview.onDidReceiveMessage(this.onWebViewMessage.bind(this), undefined, this.context.subscriptions);
            this.currentPanel.onDidChangeViewState(this.onWebViewStateChanged.bind(this));
            this.viewReady.then(() => {
            });
            fs.readFile(htmlPath.fsPath, 'utf8', (err, data) => {
                data = data.replace("$mainSrc", this.toWebViewUri(jsPath));
                this.currentPanel.webview.html = data;
                resolve(this.currentPanel);
            });
        });
    }
}
exports.UiUiView = UiUiView;
//# sourceMappingURL=UiUiView.js.map