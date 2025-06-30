"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prompt_sync_1 = __importDefault(require("prompt-sync"));
const uninstall_1 = require("../src/commands/uninstall");
const constants_1 = require("../src/constants");
jest.mock('prompt-sync');
const promptMock = jest.fn(() => 'y');
prompt_sync_1.default.mockReturnValue(promptMock);
describe('uninstall', () => {
    const version = '8.2.20';
    const versionDir = path_1.default.join(constants_1.VERSIONS_DIR, version);
    beforeAll(() => {
        if (!fs_1.default.existsSync(versionDir))
            fs_1.default.mkdirSync(versionDir, { recursive: true });
    });
    it('should uninstall PHP version if confirmed', () => {
        (0, uninstall_1.uninstall)(version);
        expect(fs_1.default.existsSync(versionDir)).toBe(false);
    });
});
