import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import logger from '../utils/logger';
import * as cheerio from 'cheerio';
import * as fileHelpers from '../utils/fileHelpers';
import { Manifest, ManifestEntry, PhpReleasesJson, PhpVariant } from '../utils/types';


export class ManifestManager {
  private manifestPath = path.join(fileHelpers.getPvmDir(), 'manifest.json');
  private manifest: Manifest | null = null;

  constructor() { }

  async loadManifest(): Promise<void> {
    try {
      if (await fs.pathExists(this.manifestPath)) {
        this.manifest = await fileHelpers.readJsonAtomic<Manifest>(this.manifestPath);
      } else {
        await this.updateManifest();
      }
    } catch (error) {
      logger.warn(`Failed to load manifest: ${(error as Error).message}`);
      this.manifest = null;
    }
  }

  async updateManifest(): Promise<void> {
    try {
      const platform = os.platform();
      const arch = os.arch();

      const entries: ManifestEntry[] = [];

      if (platform === 'win32') {
        // 1. Releases récentes depuis releases.json
        const releasesJsonUrl = 'https://windows.php.net/downloads/releases/releases.json';
        const response = await axios.get(releasesJsonUrl);
        const data: PhpReleasesJson = response.data;

        for (const versionKey of Object.keys(data)) {
          const release = data[versionKey];
          const platforms: ManifestEntry['platforms'] = {};

          Object.entries(release).forEach(([variantKey, variantValue]) => {
            if (['version', 'source', 'test_pack'].includes(variantKey)) return;

            const variant = variantValue as PhpVariant;
            const filename = variant.zip.path;

            let archKey = 'x64';
            if (filename.includes('x86') && !filename.includes('x64')) {
              archKey = 'x86';
            }

            const key = `win32-${archKey}`;

            platforms[key] = {
              url: `https://windows.php.net/downloads/releases/${filename}`,
              checksum: variant.zip.sha256 ?? '',
              archiveType: 'zip',
            };
          });

          entries.push({
            version: release.version,
            platforms,
          });
        }

        // 2. Versions plus anciennes depuis la page HTML des archives
        const archivesUrl = 'https://windows.php.net/downloads/releases/archives/';
        const archivesResp = await axios.get(archivesUrl);
        const $ = cheerio.load(archivesResp.data);

        const addedVersions = new Set(entries.map(e => e.version));

        $('a[href$=".zip"]').each((_, el) => {
          const href = $(el).attr('href');
          if (!href) return;

          const match = href.match(/php-(\d+\.\d+\.\d+)-Win32/);
          if (!match) return;

          const version = match[1];
          const filename = href;

          // Évite les doublons si déjà pris dans releases.json
          if (addedVersions.has(version)) return;

          const isNts = filename.includes('nts');
          const isX86 = filename.includes('x86') && !filename.includes('x64');
          const archKey = isX86 ? 'x86' : 'x64';
          const key = `win32-${archKey}`;

          let entry = entries.find(e => e.version === version);
          if (!entry) {
            entry = { version, platforms: {} };
            entries.push(entry);
          }

          entry.platforms[key] = {
            url: `https://windows.php.net${filename}`,
            checksum: '', // Non dispo
            archiveType: 'zip',
          };
        });

      } else {
        // UNIX: utilise la source tar.gz
        const response = await axios.get('https://www.php.net/releases/index.php?json');
        const data = response.data;

        for (const versionKey of Object.keys(data)) {
          const release = data[versionKey];
          const platforms: ManifestEntry['platforms'] = {};

          if (release.source && release.source.path.endsWith('.tar.gz')) {
            let key = '';
            if (platform === 'linux') key = 'linux-x64';
            if (platform === 'darwin') key = 'darwin-x64';

            platforms[key] = {
              url: `https://www.php.net/distributions/${release.source.path}`,
              checksum: '',
              archiveType: 'tar.gz',
            };
          }

          entries.push({
            version: release.version,
            platforms,
          });
        }
      }

      // Tri les versions du plus récent au plus ancien
      entries.sort((a, b) => (b.version.localeCompare(a.version, undefined, { numeric: true })));

      this.manifest = {
        generatedAt: new Date().toISOString(),
        entries,
      };

      await fileHelpers.writeJsonAtomic(this.manifestPath, this.manifest, { spaces: 2 });
      logger.info('Manifest updated successfully.');
    } catch (error) {
      logger.error(`Failed to update manifest: ${(error as Error).message}`);
      throw error;
    }
  }

  listAvailableVersions(): string[] {
    if (!this.manifest) return [];
    return this.manifest.entries.map(entry => entry.version);
  }

  getBinaryUrl(version: string, platform: string, arch: string): string | null {
    if (!this.manifest) return null;
    const entry = this.manifest.entries.find(e => e.version === version);
    if (!entry) return null;

    const key = `${platform}-${arch}`;

    if (entry.platforms[key]) {
      return entry.platforms[key].url;
    }

    // Fallback to any platform match
    const candidate = Object.entries(entry.platforms).find(([platKey]) =>
      platKey.startsWith(platform)
    );
    if (candidate) {
      return candidate[1].url;
    }

    return null;
  }

  getChecksum(version: string, platform: string, arch: string): string {
    if (!this.manifest) return '';
    const entry = this.manifest.entries.find(e => e.version === version);
    if (!entry) return '';

    const key = `${platform}-${arch}`;
    if (entry.platforms[key]) {
      return entry.platforms[key].checksum;
    }

    const candidate = Object.entries(entry.platforms).find(([platKey]) =>
      platKey.startsWith(platform)
    );
    if (candidate) {
      return candidate[1].checksum;
    }
    return '';
  }
}
