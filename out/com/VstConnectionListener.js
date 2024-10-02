"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dgram = require("dgram");
const vscode = require("vscode");
const werckmeisterMagic = "werckmeister-vst-funk";
let idCounter = 0;
class VstConnectionListener {
    constructor() {
        this.onMessageEventEmitter = new vscode.EventEmitter();
        this.onMessageEvent = this.onMessageEventEmitter.event;
        this.socket = null;
        this.listenerDisposables = new Map();
    }
    get port() {
        const settings = vscode.workspace.getConfiguration('werckmeister');
        return settings.vstUdpPort;
    }
    onMessageCallback(msg) {
        try {
            const json = JSON.parse(msg.toString());
            if (json.type !== werckmeisterMagic) {
                return;
            }
            if (!json.sheetPath) {
                return;
            }
            this.onMessageEventEmitter.fire(json);
        }
        catch (ex) { }
    }
    start() {
        if (this.socket !== null) {
            return;
        }
        if (this.socket === null) {
            this.socket = dgram.createSocket('udp4');
        }
        this.socket.on('message', this.onMessageCallback.bind(this));
        this.socket.bind(this.port);
    }
    stop() {
        if (!this.socket) {
            return;
        }
        this.socket.close();
        this.socket = null;
    }
    addListener(callback) {
        const id = ++idCounter;
        if (this.listenerDisposables.size === 0) {
            this.start();
        }
        this.listenerDisposables.set(id, this.onMessageEvent(callback));
        return id;
    }
    removeListener(id) {
        const disposable = this.listenerDisposables.get(id);
        if (!disposable) {
            return;
        }
        disposable.dispose();
        this.listenerDisposables.delete(id);
        if (this.listenerDisposables.size == 0 && this.socket) {
            this.stop();
        }
    }
}
exports.VstConnectionListener = VstConnectionListener;
let instance = null;
function getVstConnectionListener() {
    if (instance === null) {
        instance = new VstConnectionListener();
    }
    return instance;
}
exports.getVstConnectionListener = getVstConnectionListener;
//# sourceMappingURL=VstConnectionListener.js.map