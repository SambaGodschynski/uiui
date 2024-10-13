import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AWebView } from './AWebView';
import { Renderer, RendererValueChangedEvent } from './Renderer';

const ViewTitle = "UiUi Inspector";

const openedViews:UiUiView[] = [];
function registerInspector(inspector: UiUiView) {
	openedViews.push(inspector);
}
function unregisterInspector(inspector: UiUiView) {
	const idx = openedViews.indexOf(inspector);
	openedViews.splice(idx, 1);
}


export class UiUiView extends AWebView {
	currentPanel: vscode.WebviewPanel|null = null;
	get panel():  vscode.WebviewPanel|null {
		return this.currentPanel;
	}
	public document:vscode.TextDocument|null = null;
	onSourcesChangedBound: any;
	onDidDocumentSaveDisposable: vscode.Disposable|null= null;
	private onViewReady: ()=>void = ()=>{};
	private onViewInitialRendered: ()=>void = ()=>{};
	viewReady: Promise<void>;
	viewInitialRendered: Promise<void>;
	renderer: Renderer|null = null;
	titleUpdater: NodeJS.Timeout|null = null;
	constructor(context: vscode.ExtensionContext) {
		super(context);
		registerInspector(this);
		this.onSourcesChangedBound = this.onSourcesChanged.bind(this);
		this.viewReady = new Promise(resolve => {
			this.onViewReady = resolve;
		});
		this.viewInitialRendered = new Promise(resolve => {
			this.onViewInitialRendered = resolve;
		})
		if (vscode.window.activeTextEditor) {
			this.viewReady.then(async () => {
				this.sendSource();
			})
		}
	}

	async onSourcesChanged() {
		if (!this.currentPanel) {
			return;
		}
		//this.currentPanel.webview.postMessage(message);
	}

	sendSource() {
		if (!this.document) {
			return;
		}
		const source = this.document.getText();
		const basePath = path.dirname(this.document.uri.fsPath);
		try {
			this.renderer = new Renderer(source, basePath);
			const message = {
				msg: "updateSouce",
				source: source,
				initValues: this.renderer.values
			};
			this.currentPanel!.webview.postMessage(message);
		} catch(ex) {
			const error = ex as any;
			if (error.message) {
				vscode.window.showErrorMessage(error.message);
				return;
			}
			vscode.window.showErrorMessage("uiui: unexpected error");
		}

	}


	onDocumentSaved(document: vscode.TextDocument) {
	}

	registerListener() {
		this.onDidDocumentSaveDisposable = vscode.workspace.onDidSaveTextDocument(this.onDocumentSaved.bind(this));
	}

	onUiValueChanged(msg: RendererValueChangedEvent) {
		if(!this.renderer) {
			return;
		}
		try {
			this.renderer.valueChanged(msg);
		} catch(ex) {
			const error = ex as any;
			if (error.message) {
				vscode.window.showErrorMessage(error.message);
				return;
			}
			vscode.window.showErrorMessage("uiui: unexpected error");
		}
	}

	removeListener() {
		if (this.onDidDocumentSaveDisposable) {
			this.onDidDocumentSaveDisposable.dispose();
		}
	}

	onWebViewMessage(message: any) {
		switch(message.command) {
			case "uiuiview-ready": return this.onViewReady();
			case "onvalue-changed": return this.onUiValueChanged(message);
		}
	}

	onWebViewStateChanged(ev:vscode.WebviewPanelOnDidChangeViewStateEvent) {
	}

	onPanelDidDispose() {
		unregisterInspector(this);
		super.onPanelDidDispose();
		this.removeListener();
	}

    protected createPanelImpl(): Promise<vscode.WebviewPanel> {
        return new Promise<vscode.WebviewPanel>((resolve, reject) => {
            this.currentPanel = vscode.window.createWebviewPanel(
                'uiui.Inspector', // Identifies the type of the webview. Used internally
                ViewTitle, // Title of the panel displayed to the user
                vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
                {
					enableScripts: true,
					retainContextWhenHidden: true,
                }
			);
            let jsPath = vscode.Uri.file(this.getExtensionPath('WebViewApp', 'dist', 'WebViewApp.dist.js'));
            let htmlPath = vscode.Uri.file(this.getExtensionPath('WebViewApp', 'inspector.html'));

			this.currentPanel.webview.onDidReceiveMessage(this.onWebViewMessage.bind(this), undefined, this.context.subscriptions);
			this.currentPanel.onDidChangeViewState(this.onWebViewStateChanged.bind(this));
			this.viewReady.then(()=>{
			});

            fs.readFile(htmlPath.fsPath, 'utf8', (err, data) => {
                data = data.replace("$mainSrc", this.toWebViewUri(jsPath))
                this.currentPanel!.webview.html = data;
                resolve(this.currentPanel as vscode.WebviewPanel);
            });

        });
    }
}