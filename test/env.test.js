"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../src/commands/env");
const constants_1 = require("../src/constants");
describe('env', () => {
    const version = '8.2.20';
    const binDir = path_1.default.join(constants_1.VERSIONS_DIR, version, 'bin');
    beforeAll(() => {
        fs_1.default.writeFileSync(constants_1.CONFIG_FILE, `php=${version}\n`);
        fs_1.default.mkdirSync(binDir, { recursive: true });
    });
    it('should output export PATH command', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        (0, env_1.env)();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('export PATH'));
        consoleSpy.mockRestore();
    });
});
