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
const Player_1 = require("../com/Player");
const VstConnectionsProvider_1 = require("../com/VstConnectionsProvider");
const ACommand_1 = require("./ACommand");
class ConnectToVst extends ACommand_1.ACommand {
    execute(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const treeItem = args[0][0];
            const player = Player_1.getPlayer();
            if (player.state === Player_1.PlayerState.ConnectedToVst) {
                yield player.closeVstConnection();
            }
            yield player.connectToVst(treeItem.connection);
            VstConnectionsProvider_1.getVstConnectionProvider().refresh();
        });
    }
}
exports.ConnectToVst = ConnectToVst;
//# sourceMappingURL=ConnectToVst.js.map