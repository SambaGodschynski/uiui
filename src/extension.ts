// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ACommand } from './commands/ACommand';
import { ShowInspector } from './commands/ShowInspector';
import { FileWatcher } from './com/FileWatcher';

function excuteCommand(type: (new (context: vscode.ExtensionContext) => ACommand), context: vscode.ExtensionContext, ...args: any[]): void {
	let cmd = new type(context);
	cmd.execute(args);
}
const _ns = "extension.werckmeister";
export const WMCommandOpenDebugger = `${_ns}.inspector`;
let diagnosticCollection: vscode.DiagnosticCollection;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand(WMCommandOpenDebugger, excuteCommand.bind(null, ShowInspector, context));
	context.subscriptions.push(disposable);	
	
	disposable = new FileWatcher();
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
