"use strict";
/**
 * stores the used sheet files in a history
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const Player_1 = require("./Player");
const Play_1 = require("../commands/Play");
const _ = require("lodash");
const fs = require("fs");
class SheetHistory {
    constructor() {
        this.fileHistory = [];
        this.lastplayed = undefined;
        vscode.window.onDidChangeActiveTextEditor(this.onTextEditorChanged.bind(this));
        if (vscode.window.activeTextEditor) {
            this.onDocument(vscode.window.activeTextEditor.document);
        }
        const player = Player_1.getPlayer();
        player.playerMessage.on(Player_1.OnPlayerStateChanged, this.onPlayerStateChanged.bind(this));
    }
    onTextEditorChanged(editor) {
        if (!editor) {
            return;
        }
        this.onDocument(editor.document);
    }
    onDocument(document) {
        const fspath = document.uri.fsPath;
        if (!fspath) {
            return;
        }
        if (!fs.existsSync(fspath)) {
            return;
        }
        this.fileHistory.push(fspath);
    }
    onPlayerStateChanged(state) {
        if (state === Player_1.PlayerState.Playing) {
            const player = Player_1.getPlayer();
            this.lastplayed = player.currentFile;
        }
    }
    get currentFile() {
        const filePath = _(this.fileHistory)
            .last();
        if (!filePath) {
            return undefined;
        }
        if (!Play_1.isSheetFile(filePath)) {
            return undefined;
        }
        return filePath;
    }
    get lastPlayedSheetFile() {
        return this.lastplayed;
    }
    get lastVisitedSheetFile() {
        return _(this.fileHistory)
            .filter(file => file.endsWith('.sheet'))
            .last();
    }
}
let _currentHistory;
function getSheetHistory() {
    if (!_currentHistory) {
        _currentHistory = new SheetHistory();
    }
    return _currentHistory;
}
exports.getSheetHistory = getSheetHistory;
//# sourceMappingURL=SheetHistory.js.map