"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const list_1 = require("../src/commands/list");
const constants_1 = require("../src/constants");
describe('list', () => {
    beforeAll(() => {
        if (!fs_1.default.existsSync(constants_1.VERSIONS_DIR))
            fs_1.default.mkdirSync(constants_1.VERSIONS_DIR, { recursive: true });
        fs_1.default.mkdirSync(path_1.default.join(constants_1.VERSIONS_DIR, '8.2.20'), { recursive: true });
        fs_1.default.writeFileSync(constants_1.CONFIG_FILE, 'php=8.2.20\n');
    });
    it('should list installed versions and highlight current', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        (0, list_1.list)();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('(current)'));
        consoleSpy.mockRestore();
    });
});
