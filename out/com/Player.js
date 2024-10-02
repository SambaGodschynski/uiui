"use strict";
/**
 * exceutes the werckmeister player: sheetp
 */
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
const child_process_1 = require("child_process");
const dgram = require("dgram");
const EventEmitter = require("events");
const vscode = require("vscode");
const path = require("path");
const EditorEventDecorator_1 = require("./EditorEventDecorator");
const VstConnectionsProvider_1 = require("./VstConnectionsProvider");
const VstConnectionListener_1 = require("./VstConnectionListener");
const Language_1 = require("../language/Language");
const freeUdpPort = require('udp-free-port');
exports.IsWindows = process.platform === 'win32';
exports.PlayerExecutable = exports.IsWindows ? 'sheetp.exe' : 'sheetp';
function werckmeisterWorkingDirectory() {
    const settings = vscode.workspace.getConfiguration('werckmeister');
    const strPath = settings.werckmeisterBinaryDirectory;
    if (!strPath) {
        return "";
    }
    return strPath;
}
exports.werckmeisterWorkingDirectory = werckmeisterWorkingDirectory;
function toWMBINPath(executable) {
    return path.join(werckmeisterWorkingDirectory(), executable);
}
exports.toWMBINPath = toWMBINPath;
class Config {
    constructor() {
        this.watch = false;
        this.funkfeuer = false;
        this.info = false;
        this.port = 8080;
        this.begin = 0;
        this.sheetPath = "";
        this.sigintWorkaround = exports.IsWindows ? true : false;
    }
}
;
function getFreeUdpPort() {
    return new Promise((resolve, reject) => {
        freeUdpPort((err, port) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(port);
        });
    });
}
exports.OnPlayerMessageEvent = 'OnPlayerMessageEvent';
exports.OnPlayerStateChanged = 'OnPlayerStateChanged';
exports.OnSourcesChanged = 'OnSourcesChanged';
var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["Undefined"] = 0] = "Undefined";
    PlayerState[PlayerState["StartPlaying"] = 1] = "StartPlaying";
    PlayerState[PlayerState["Playing"] = 2] = "Playing";
    PlayerState[PlayerState["ConnectingToVst"] = 3] = "ConnectingToVst";
    PlayerState[PlayerState["ConnectedToVst"] = 4] = "ConnectedToVst";
    PlayerState[PlayerState["Stopped"] = 5] = "Stopped";
    PlayerState[PlayerState["Stopping"] = 6] = "Stopping";
    PlayerState[PlayerState["Pausing"] = 7] = "Pausing";
    PlayerState[PlayerState["Paused"] = 8] = "Paused";
})(PlayerState = exports.PlayerState || (exports.PlayerState = {}));
class Player {
    constructor() {
        this._pid = 0;
        this._state = PlayerState.Stopped;
        this.socket = null;
        this.playerMessage = new EventEmitter();
        this.process = null;
        this.sheetInfo = null;
        this.currentFile = null;
        this.vstConnection = null;
        this.begin = 0;
        this._sheetTime = 0;
        this.lastUpdateTimestamp = 0;
        this.vstConnectionListenerId = null;
    }
    get inTransition() {
        return this.state === PlayerState.StartPlaying
            || this.state === PlayerState.Stopping
            || this.state === PlayerState.Pausing
            || this.state === PlayerState.ConnectedToVst;
    }
    get isStateChangeLocked() {
        return this.inTransition;
    }
    get wmPlayerPath() {
        return toWMBINPath(exports.PlayerExecutable);
    }
    get isPlaying() {
        return !!this.process;
    }
    get isStopped() {
        return this.state === PlayerState.Stopped;
    }
    get isPaused() {
        return this.state === PlayerState.Paused;
    }
    get isVstMode() {
        return this.state === PlayerState.ConnectedToVst
            || this.state === PlayerState.ConnectingToVst;
    }
    get sheetTime() {
        return this._sheetTime;
    }
    set sheetTime(val) {
        this._sheetTime = val;
        if (val === 0) {
            this.playerMessage.emit(exports.OnPlayerMessageEvent, { sheetTime: 0 });
        }
    }
    get state() {
        return this._state;
    }
    reset() {
        this.currentFile = null;
        this.sheetTime = 0;
        this._pid = 0;
        this.lastUpdateTimestamp = 0;
    }
    set state(val) {
        if (this.state === val) {
            return;
        }
        const oldState = this._state;
        this._state = val;
        if (this._state === PlayerState.Stopped) {
            this.begin = 0;
            this.reset();
        }
        if (this._state === PlayerState.Paused) {
            this._pid = 0;
        }
        this.playerMessage.emit(exports.OnPlayerStateChanged, this._state, oldState);
    }
    updateSheetTime(message) {
        if (message.sheetTime) {
            this.sheetTime = message.sheetTime;
        }
    }
    checkForUpdate(message) {
        if (!message.lastUpdateTimestamp) {
            return;
        }
        if (this.lastUpdateTimestamp === 0) {
            this.lastUpdateTimestamp = message.lastUpdateTimestamp;
            return;
        }
    }
    startUdpListener(port, onMessageCallback) {
        if (this.socket !== null) {
            return;
        }
        if (this.socket === null) {
            this.socket = dgram.createSocket('udp4');
        }
        this.socket.on('message', onMessageCallback);
        this.socket.bind(port);
        console.log(`listen udp messages on port ${port}`);
    }
    stopUdpListener() {
        if (this.socket === null) {
            return;
        }
        this.socket.removeAllListeners();
        this.socket.close();
        this.socket = null;
        console.log('udp listener stopped');
    }
    _execute(cmd, args, callback) {
        const newProcess = child_process_1.spawn(cmd, args);
        let stdout = "";
        let stderr = "";
        newProcess.stdout.on('data', (data) => {
            stdout += data;
        });
        newProcess.stderr.on('data', (data) => {
            stderr += data;
        });
        newProcess.on('close', (code) => {
            const hasError = code !== 0;
            callback(hasError ? {} : null, stdout, stderr);
        });
        return newProcess;
    }
    listDevices() {
        return new Promise((resolve, reject) => {
            this._execute(this.wmPlayerPath, ["--list"], (err, stdout, stderr) => {
                if (!!err) {
                    reject(err);
                    return;
                }
                try {
                    resolve(stdout);
                }
                catch (ex) {
                    reject(ex);
                }
            });
        });
    }
    updateDocumentInfo() {
        return new Promise((resolve, reject) => {
            const config = new Config();
            config.info = true;
            config.sheetPath = this.currentFile;
            this._execute(this.wmPlayerPath, this.configToArgs(config), (err, stdout, stderr) => {
                if (!!err) {
                    reject(err);
                    return;
                }
                try {
                    let json = JSON.parse(stdout);
                    resolve(json);
                }
                catch (ex) {
                    reject(ex);
                }
            });
        }).then((sourceMap) => {
            this.sheetInfo = sourceMap;
            this.sheetInfo.mainDocument = this.currentFile;
            return this.sheetInfo;
        });
    }
    play(sheetPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPlaying || this.isStateChangeLocked) {
                return;
            }
            const oldState = this.state;
            const config = new Config();
            if (oldState === PlayerState.Paused) {
                config.begin = this.sheetTime;
            }
            else {
                config.begin = this.begin;
            }
            this.currentFile = sheetPath;
            yield this.updateDocumentInfo();
            this.notifyDocumentWarningsIfAny();
            const promise = this._startPlayer(sheetPath, config);
            this.state = PlayerState.StartPlaying;
            return promise;
        });
    }
    pause() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isStateChangeLocked) {
                return;
            }
            this.state = PlayerState.Pausing;
            return new Promise((resolve, reject) => {
                if (!this.isPlaying) {
                    resolve();
                    return;
                }
                this.stopUdpListener();
                this.killProcess(this.process, this._pid);
                let waitUntilEnd = () => {
                    if (!this.isPlaying) {
                        resolve();
                        this.state = PlayerState.Paused;
                        return;
                    }
                    setTimeout(waitUntilEnd, 100);
                };
                waitUntilEnd();
            });
        });
    }
    killProcessWindowsWorkaround(pid) {
        if (!pid) {
            return;
        }
        const killPath = toWMBINPath(`win32-kill-sheetp-process.exe`);
        this._execute(killPath, [pid.toString()], (err, stdout, stderr) => {
            if (!!err) {
                vscode.window.showErrorMessage(stderr.toString());
            }
        });
    }
    killProcess(childProcess, pid) {
        if (exports.IsWindows) {
            this.killProcessWindowsWorkaround(pid);
            return;
        }
        childProcess.kill("SIGINT");
    }
    /**
     * waits for an expected state, rejects if state changes but not to the expected
     * @param expectedState
     */
    waitForStateChange(expectedState, waitIdleMillis = 500, timeoutMillis = 3000) {
        const currentState = this.state;
        let waitedTotal = 0;
        timeoutMillis += waitIdleMillis; // first call doesn't wait
        return new Promise((resolve, reject) => {
            const checkConnection = () => {
                waitedTotal += waitIdleMillis;
                if (waitedTotal > timeoutMillis) {
                    reject();
                    return;
                }
                if (this.state === expectedState) {
                    resolve();
                    return;
                }
                if (this.state !== currentState) {
                    reject();
                    return;
                }
                setTimeout(checkConnection.bind(this), waitIdleMillis);
            };
            checkConnection();
        });
    }
    connectToVst(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state !== PlayerState.Stopped) {
                yield this.stop();
            }
            if (this.vstConnectionListenerId !== null) {
                return;
            }
            this.state = PlayerState.ConnectingToVst;
            try {
                this.currentFile = connection.sheetPath;
                yield this.checkCurrentSheetForErrors();
                this.vstConnectionListenerId = VstConnectionListener_1.getVstConnectionListener().addListener(this.onVstUdpMessage.bind(this));
                yield this.waitForStateChange(PlayerState.ConnectedToVst);
                connection.state = VstConnectionsProvider_1.ConnectionState.Connected;
                this.vstConnection = connection;
            }
            catch (_a) {
                this.state = PlayerState.Stopped;
                this.vstConnectionListenerId = null;
                return;
            }
        });
    }
    checkCurrentSheetForErrors() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.currentFile) {
                    return;
                }
                const diagnose = yield Language_1.getLanguage().features.diagnostic.update(this.currentFile);
                if (diagnose.hasErrors) {
                    const sourcefile = diagnose.errorResult.sourceFile || "unkown location";
                    vscode.window.showErrorMessage(` ${sourcefile}: ${diagnose.errorResult.errorMessage}`, 'Ok');
                    return;
                }
                else {
                    yield this.updateDocumentInfo();
                }
            }
            catch (ex) {
                vscode.window.showErrorMessage(` ${this.currentFile}: ${ex}`, 'Ok');
            }
        });
    }
    closeVstConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isVstMode) {
                return;
            }
            if (!this.vstConnectionListenerId) {
                return;
            }
            if (!this.vstConnection) {
                return;
            }
            VstConnectionListener_1.getVstConnectionListener().removeListener(this.vstConnectionListenerId);
            this.vstConnectionListenerId = null;
            this.state = PlayerState.Stopped;
            this.vstConnection.state = VstConnectionsProvider_1.ConnectionState.Open;
        });
    }
    onVstUdpMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.sheetPath !== this.currentFile) {
                return;
            }
            if (this.state !== PlayerState.ConnectedToVst) {
                this.state = PlayerState.ConnectedToVst;
            }
            this.updateSheetTime(message);
            this.checkForUpdate(message);
            this.playerMessage.emit(exports.OnPlayerMessageEvent, message);
        });
    }
    onPlayerUdpMessage(msg) {
        if (this.state === PlayerState.StartPlaying) {
            this.state = PlayerState.Playing;
        }
        let message = JSON.parse(msg.toString());
        if (this._pid === 0 && message.pid) {
            this._pid = message.pid;
        }
        this.updateSheetTime(message);
        this.checkForUpdate(message);
        this.playerMessage.emit(exports.OnPlayerMessageEvent, message);
    }
    _startPlayer(sheetPath, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const nextFreePort = yield getFreeUdpPort();
                config.funkfeuer = true;
                config.watch = true;
                config.port = nextFreePort;
                config.sheetPath = sheetPath;
                this.process = this._execute(this.wmPlayerPath, this.configToArgs(config), (err, stdout, stderr) => {
                    if (!!err) {
                        // due to a bug in the player it may happen that a part of
                        // the error message is written to stdout
                        const errorMessage = `${stderr} ${stdout}`;
                        reject(errorMessage);
                        this.process = null;
                        this.currentFile = null;
                        this.stopUdpListener();
                        this.state = PlayerState.Stopped;
                        return;
                    }
                    resolve();
                    this.stopUdpListener();
                    this.process = null;
                    if (this.state === PlayerState.Playing || this.state === PlayerState.StartPlaying) {
                        this.state = PlayerState.Stopped;
                    }
                });
                this.startUdpListener(config.port, this.onPlayerUdpMessage.bind(this));
            }));
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isStopped || this.isStateChangeLocked) {
                return;
            }
            if (this.isPaused) {
                this.state = PlayerState.Stopped;
                return;
            }
            this.state = PlayerState.Stopping;
            return new Promise((resolve, reject) => {
                this.stopUdpListener();
                this.killProcess(this.process, this._pid);
                let waitUntilEnd = () => {
                    if (!this.isStopped) {
                        resolve();
                        this.state = PlayerState.Stopped;
                        return;
                    }
                    setTimeout(waitUntilEnd, 100);
                };
                waitUntilEnd();
            });
        });
    }
    notifyDocumentWarningsIfAny() {
        if (!this.sheetInfo || !this.sheetInfo.warnings || this.sheetInfo.warnings.length === 0) {
            return;
        }
        for (let warning of this.sheetInfo.warnings) {
            vscode.window.showWarningMessage(warning.message);
        }
    }
    configToString(config) {
        return this.configToArgs(config).join(" ");
    }
    configToArgs(config) {
        if (!config.sheetPath) {
            throw new Error('missing sheet path');
        }
        let options = [
            config.sheetPath,
            '--notime'
        ];
        if (config.watch) {
            options.push("--watch");
        }
        if (config.funkfeuer) {
            options.push(`--funkfeuer=localhost:${config.port}`);
        }
        if (config.info) {
            options.push('--info');
        }
        if (config.sigintWorkaround) {
            options.push('--win32-sigint-workaround');
        }
        if (config.begin > 0) {
            options.push(`--begin=${config.begin}`);
        }
        return options;
    }
}
exports.Player = Player;
let globalPlayer;
function getPlayer() {
    if (!globalPlayer) {
        globalPlayer = new Player();
        EditorEventDecorator_1.getEditorEventDecorator(); // initiate singleton
    }
    return globalPlayer;
}
exports.getPlayer = getPlayer;
//# sourceMappingURL=Player.js.map