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
const Player_1 = require("../../../com/Player");
const os_1 = require("os");
class EnvironmentInspector {
    constructor() {
        this.environment = "local";
    }
    getMidiOutputDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const player = Player_1.getPlayer();
                const devicesStr = yield player.listDevices();
                const devices = devicesStr.split(os_1.EOL);
                return devices
                    .filter(line => !!line && line.trim().length > 0)
                    .map(line => (line.match(/^(\d+):\s*(.*)$/) || []))
                    .map(match => ({
                    name: match[2],
                    id: match[1]
                }))
                    .filter(x => !!x.id);
            }
            catch (_a) {
                return [];
            }
        });
    }
}
exports.EnvironmentInspector = EnvironmentInspector;
//# sourceMappingURL=EnvironmentInspector.js.map