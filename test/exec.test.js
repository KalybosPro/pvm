"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process = __importStar(require("child_process"));
const exec_1 = require("../src/commands/exec");
const constants_1 = require("../src/constants");
jest.mock('child_process');
const spawnSyncMock = child_process.spawnSync;
describe('exec', () => {
    const version = '8.2.20';
    const phpPath = path_1.default.join(constants_1.VERSIONS_DIR, version, 'bin', 'php');
    beforeAll(() => {
        fs_1.default.writeFileSync(constants_1.CONFIG_FILE, `php=${version}\n`);
        fs_1.default.mkdirSync(path_1.default.dirname(phpPath), { recursive: true });
        fs_1.default.writeFileSync(phpPath, '');
    });
    it('should call spawnSync with php binary', () => {
        spawnSyncMock.mockReturnValue({ status: 0 });
        (0, exec_1.execPhp)(['-v']);
        expect(spawnSyncMock).toHaveBeenCalledWith(phpPath, ['-v'], { stdio: 'inherit' });
    });
});
