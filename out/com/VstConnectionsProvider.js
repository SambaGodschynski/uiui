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
const path = require("path");
const Player_1 = require("./Player");
const VstConnectionListener_1 = require("./VstConnectionListener");
const scanWaitTimeMillis = 2 * 1000;
var ConnectionState;
(function (ConnectionState) {
    ConnectionState["Open"] = "Not Connected";
    ConnectionState["Connected"] = "Connected";
})(ConnectionState = exports.ConnectionState || (exports.ConnectionState = {}));
class Connection {
    constructor(port, sheetPath = "", _host = "") {
        this.port = port;
        this.sheetPath = sheetPath;
        this._host = _host;
        this._state = ConnectionState.Open;
    }
    get state() {
        return this._state;
    }
    set state(newValue) {
        this._state = newValue;
    }
    get fileName() {
        return path.basename(this.sheetPath);
    }
    get host() {
        if (!this._host || this._host.toLowerCase().includes("unknown")) {
            return "VST";
        }
        return this._host;
    }
}
exports.Connection = Connection;
;
let vstConnectionsProviderInstance;
class VstConnectionsProvider {
    constructor() {
        this.connections = new Map();
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            const connections = yield this.scanForConnections();
            return connections.map(x => new VstConnectionTreeItem(x));
        });
    }
    scanForConnections() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const sheetFiles = new Set();
                const hosts = new Map();
                const vstConnectionListener = VstConnectionListener_1.getVstConnectionListener();
                const listenerId = vstConnectionListener.addListener(msg => {
                    if (!msg.sheetPath) {
                        return;
                    }
                    sheetFiles.add(msg.sheetPath);
                    hosts.set(msg.sheetPath, msg.host || "");
                });
                setTimeout(() => {
                    vstConnectionListener.removeListener(listenerId);
                    const receivedSheets = Array.from(sheetFiles);
                    const newConnections = receivedSheets
                        .filter(x => this.connections.has(x) === false)
                        .map(x => new Connection(vstConnectionListener.port, x, hosts.get(x)));
                    for (const newConnection of newConnections) {
                        this.connections.set(newConnection.sheetPath, newConnection);
                    }
                    const lostConnections = Array.from(this.connections.keys())
                        .filter(x => receivedSheets.includes(x) === false);
                    for (const lostConnectionId of lostConnections) {
                        const connection = this.connections.get(lostConnectionId);
                        if (connection && connection.state === ConnectionState.Connected) {
                            Player_1.getPlayer().closeVstConnection();
                        }
                        this.connections.delete(lostConnectionId);
                    }
                    resolve(Array.from(this.connections.values()));
                }, scanWaitTimeMillis);
            });
        });
    }
}
exports.VstConnectionsProvider = VstConnectionsProvider;
function getVstConnectionProvider() {
    if (!vstConnectionsProviderInstance) {
        vstConnectionsProviderInstance = new VstConnectionsProvider();
    }
    return vstConnectionsProviderInstance;
}
exports.getVstConnectionProvider = getVstConnectionProvider;
class VstConnectionTreeItem extends vscode.TreeItem {
    constructor(connection) {
        super(`${connection.host}: ${connection.fileName}`);
        this.connection = connection;
        this.description = connection.state;
        const isConnected = this.connection.state === ConnectionState.Connected;
        this.contextValue = `werckmeister-vst-instance-${isConnected ? 'connected' : 'open'}`;
        const fileName = `vst_${isConnected ? 'cn_' : ''}`;
        this.iconPath = {
            light: path.join(__filename, '..', '..', 'resources', `${fileName}light.svg`),
            dark: path.join(__filename, '..', '..', 'resources', `${fileName}dark.svg`)
        };
    }
}
exports.VstConnectionTreeItem = VstConnectionTreeItem;
//# sourceMappingURL=VstConnectionsProvider.js.map