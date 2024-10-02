import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AWebView } from './AWebView';
import { WMCommandOpenDebugger } from '../extension';

const UpdateIfThisExtension:string[] = [
	'.sheet',
	'.template',
	'.conductions'
];

const ViewTitle = "Werckmeister Inspector";
const TitleUpdaterIntervalMillis = 500;

const openedViews:InspectorView[] = [];
function registerInspector(inspector: InspectorView) {
	openedViews.push(inspector);
}
function unregisterInspector(inspector: InspectorView) {
	const idx = openedViews.indexOf(inspector);
	openedViews.splice(idx, 1);
}

interface EventSourceInfo {
	documentPath: string,
	documentSourceId: number,
	eventId: number,
	midiType: number,
	pitchAlias: string,
	sourcePositionBegin:number,
	sourcePositionEnd:number,
	trackId:number
}

export class InspectorView extends AWebView {
	currentPanel: vscode.WebviewPanel|null = null;
	get panel():  vscode.WebviewPanel|null {
		return this.currentPanel;
	}
	onPlayerMessageBound: any;
	onPlayerStateChangedBound: any;
	onSourcesChangedBound: any;
	onDidDocumentSaveDisposable: vscode.Disposable|null= null;
	private onViewReady: ()=>void = ()=>{};
	private onViewInitialRendered: ()=>void = ()=>{};
	viewReady: Promise<void>;
	viewInitialRendered: Promise<void>;
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
			const currentDocumentPath = vscode.window.activeTextEditor.document.fileName;
			this.viewReady.then(async () => {
				// this.currentPanel!.webview.postMessage({
				// 	playerState: {newState: PlayerState[getPlayer().state]}
				// });
				// this.onViewInitialRendered();
			})
		}
	}

	async onSourcesChanged() {
		if (!this.currentPanel) {
			return;
		}
		//this.currentPanel.webview.postMessage(message);
	}




	onDocumentSaved(document: vscode.TextDocument) {
	}

	registerListener() {
		this.onDidDocumentSaveDisposable = vscode.workspace.onDidSaveTextDocument(this.onDocumentSaved.bind(this));
	}

	removeListener() {
		if (this.onDidDocumentSaveDisposable) {
			this.onDidDocumentSaveDisposable.dispose();
		}
	}
	onWebViewMessage(message: any) {
		console.log(message);
		switch(message.command) {
			
		}
	}

	onWebViewStateChanged(ev:vscode.WebviewPanelOnDidChangeViewStateEvent) {
	}

	onPanelDidDispose() {
		unregisterInspector(this);
		super.onPanelDidDispose();
		this.removeListener();
	}

	private static async waitUntilInspectorAreAvailable(): Promise<void> {
		let maxTries = 20;
		await new Promise<void>((resolve, reject) => {
			const check = () => {
				if (openedViews.length > 0) {
					resolve();
				}
				if (--maxTries <= 0) {
					reject();
				}
				setTimeout(check, 500);
			};
			check();
		});
		await Promise.all(openedViews.map(x => x.viewInitialRendered));
	}

    protected createPanelImpl(): Promise<vscode.WebviewPanel> {
        return new Promise<vscode.WebviewPanel>((resolve, reject) => {
            this.currentPanel = vscode.window.createWebviewPanel(
                'werckmeister.Inspector', // Identifies the type of the webview. Used internally
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