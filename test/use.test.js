"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const use_1 = require("../src/commands/use");
const constants_1 = require("../src/constants");
describe('use', () => {
    const version = '8.2.20';
    const versionDir = path_1.default.join(constants_1.VERSIONS_DIR, version);
    beforeAll(() => {
        if (!fs_1.default.existsSync(versionDir))
            fs_1.default.mkdirSync(versionDir, { recursive: true });
    });
    it('should write .pvmrc with selected version', () => {
        (0, use_1.use)(version);
        const content = fs_1.default.readFileSync(constants_1.CONFIG_FILE, 'utf-8');
        expect(content).toContain(`php=${version}`);
    });
});
