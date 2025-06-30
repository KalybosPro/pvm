import fs from 'fs';
import path from 'path';
import { use } from '../src/commands/use';
import { VERSIONS_DIR, CONFIG_FILE } from '../src/constants';

describe('use', () => {
  const version = '8.2.20';
  const versionDir = path.join(VERSIONS_DIR, version);

  beforeAll(() => {
    if (!fs.existsSync(versionDir)) fs.mkdirSync(versionDir, { recursive: true });
  });

  it('should write .pvmrc with selected version', () => {
    use(version);
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
    expect(content).toContain(`php=${version}`);
  });
});
