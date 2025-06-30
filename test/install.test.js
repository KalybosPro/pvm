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
const install_1 = require("../src/commands/install");
const constants_1 = require("../src/constants");
jest.mock('child_process');
const execSyncMock = child_process.execSync;
describe('install', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        if (!fs_1.default.existsSync(constants_1.VERSIONS_DIR))
            fs_1.default.mkdirSync(constants_1.VERSIONS_DIR, { recursive: true });
    });
    it('should install PHP version using php-build', () => {
        const version = '8.2.20';
        const versionDir = path_1.default.join(constants_1.VERSIONS_DIR, version);
        if (fs_1.default.existsSync(versionDir))
            fs_1.default.rmSync(versionDir, { recursive: true });
        execSyncMock.mockImplementation((cmd) => {
            if (cmd.includes('command -v php-build'))
                return '/usr/local/bin/php-build\n';
            if (cmd.includes('php-build'))
                return '';
            return '';
        });
        (0, install_1.install)(version);
        expect(execSyncMock).toHaveBeenCalledWith(expect.stringContaining('php-build'), expect.any(Object));
    });
    it('should not install if version already exists', () => {
        const version = '8.2.21';
        const versionDir = path_1.default.join(constants_1.VERSIONS_DIR, version);
        fs_1.default.mkdirSync(versionDir, { recursive: true });
        (0, install_1.install)(version);
        expect(execSyncMock).not.toHaveBeenCalledWith(expect.stringContaining('php-build'), expect.any(Object));
    });
});
