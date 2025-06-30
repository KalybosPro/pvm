"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const current_1 = require("../src/commands/current");
const constants_1 = require("../src/constants");
describe('current', () => {
    it('should display current PHP version', () => {
        fs_1.default.writeFileSync(constants_1.CONFIG_FILE, 'php=8.2.20\n');
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        (0, current_1.current)();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('8.2.20'));
        consoleSpy.mockRestore();
    });
});
