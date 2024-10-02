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
/**
 * executes the werckmeister compiler: sheetc
 */
const child_process_1 = require("child_process");
const Player_1 = require("./Player");
const extension_1 = require("../extension");
exports.CompilerExecutable = Player_1.IsWindows ? 'sheetc.exe' : 'sheetc';
const debugSymbolSupportVersion = 10410;
var CompilerMode;
(function (CompilerMode) {
    CompilerMode["normal"] = "normal";
    CompilerMode["json"] = "json";
    CompilerMode["validate"] = "validate";
    CompilerMode["debugSymbols"] = "debugSymbols";
})(CompilerMode = exports.CompilerMode || (exports.CompilerMode = {}));
let _lastVersionCheckSucceed = false;
let _debugSymbolSupport = null;
exports.unknownSourcePositionValue = 2147483647;
class Params {
    constructor(sheetPath = "", mode = CompilerMode.normal) {
        this.sheetPath = sheetPath;
        this.mode = mode;
        this.getVersion = false;
        this.output = null;
    }
}
exports.Params = Params;
;
class VersionMismatchException extends Error {
    constructor(currentVersion, minimumVersion = extension_1.WMMinimumWerckmeisterCompilerVersion) {
        super(`minimum required Werckmeister version is ${minimumVersion}`);
        this.currentVersion = currentVersion;
        this.minimumVersion = minimumVersion;
    }
}
exports.VersionMismatchException = VersionMismatchException;
function werckmeisterVersionToNumber(version) {
    version = version.replace(/\./g, "");
    let number = 0;
    let base = 10000;
    for (const char of version) {
        number += Number.parseInt(char) * base;
        base /= 10;
    }
    return number;
}
exports.werckmeisterVersionToNumber = werckmeisterVersionToNumber;
class ValidationResult {
    constructor(source) {
        this.source = source;
    }
    get hasErrors() {
        return !!this.errorResult.errorMessage;
    }
    get validationResult() {
        return this.source;
    }
    get errorResult() {
        return this.source;
    }
}
exports.ValidationResult = ValidationResult;
class Compiler {
    constructor() {
        this._pid = 0;
        this.process = null;
    }
    get wmCompilerPath() {
        return Player_1.toWMBINPath(exports.CompilerExecutable);
    }
    getVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const params = new Params();
            params.getVersion = true;
            let version = yield this.executeCompiler(params);
            version = version.split("@")[0];
            return version;
        });
    }
    isDebugSymbolsSupported() {
        return __awaiter(this, void 0, void 0, function* () {
            if (_debugSymbolSupport === null) {
                yield this.checkVersion();
            }
            if (_debugSymbolSupport === null) {
                return false;
            }
            return _debugSymbolSupport;
        });
    }
    checkVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            if (_lastVersionCheckSucceed) {
                return;
            }
            const strVersion = yield this.getVersion();
            const version = werckmeisterVersionToNumber(strVersion);
            const minVersion = werckmeisterVersionToNumber(extension_1.WMMinimumWerckmeisterCompilerVersion);
            _debugSymbolSupport = version >= debugSymbolSupportVersion;
            if (version >= minVersion) {
                _lastVersionCheckSucceed = true;
                return;
            }
            throw new VersionMismatchException(strVersion);
        });
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
    executeCompiler(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.process = this._execute(this.wmCompilerPath, this.configToArgs(params), (err, stdout, stderr) => {
                    if (!!err) {
                        this.process = null;
                        if (params.mode !== CompilerMode.validate || !stdout) {
                            reject(stderr);
                            return;
                        }
                        resolve(stdout);
                        return;
                    }
                    resolve(stdout.toString());
                    this.process = null;
                });
            });
        });
    }
    compile(sheetPath, mode = CompilerMode.normal, output = null) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkVersion();
            if (mode == CompilerMode.debugSymbols && !this.isDebugSymbolsSupported) {
                return "{}";
            }
            const params = new Params(sheetPath, mode);
            params.output = output;
            return this.executeCompiler(params);
        });
    }
    validate(sheetPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const str = yield this.compile(sheetPath, CompilerMode.validate);
            const obj = JSON.parse(str);
            return new ValidationResult(obj);
        });
    }
    configToArgs(params) {
        if (params.getVersion) {
            return ["--version"];
        }
        if (!params.sheetPath) {
            throw new Error('missing sheet path');
        }
        let options = [
            params.sheetPath,
        ];
        if (params.mode) {
            options.push(`--mode=${params.mode.toString()}`);
        }
        if (params.output) {
            options.push(`--output=${params.output}`);
        }
        return options;
    }
}
exports.Compiler = Compiler;
//# sourceMappingURL=Compiler.js.map