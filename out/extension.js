"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const ShowInspector_1 = require("./commands/ShowInspector");
const FileWatcher_1 = require("./com/FileWatcher");
function excuteCommand(type, context, ...args) {
    let cmd = new type(context);
    cmd.execute(args);
}
const _ns = "extension.uiui";
exports.WMCommandOpenDebugger = `${_ns}.inspector`;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let disposable = vscode.commands.registerCommand(exports.WMCommandOpenDebugger, excuteCommand.bind(null, ShowInspector_1.ShowInspector, context));
    context.subscriptions.push(disposable);
    disposable = new FileWatcher_1.FileWatcher();
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map