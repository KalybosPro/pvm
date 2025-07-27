import fs from 'fs-extra';
import axios from 'axios';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import stream from 'stream';
import { promisify } from 'util';
import decompress from 'decompress';
import logger from '../utils/logger';

const pipeline = promisify(stream.pipeline);

export class DownloadManager {
  constructor() { }

  async downloadWithResume(url: string, destPath: string, spinner?: { text: string; start: () => void; stop: () => void; succeed: (msg: string) => void; fail: (msg: string) => void; }): Promise<void> {
    const tempPath = destPath + '.part';
    let start = 0;
    if (await fs.pathExists(tempPath)) {
      const stats = await fs.stat(tempPath);
      start = stats.size;
    }

    const headers: Record<string, string> = {};
    if (start > 0) {
      headers.Range = `bytes=${start}-`;
    }

    const writer = fs.createWriteStream(tempPath, {
      flags: start > 0 ? 'a' : 'w',
    });

    try {
      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream',
        headers,
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      const totalLength = response.headers['content-length']
        ? parseInt(response.headers['content-length'], 10) + start
        : NaN;

      let downloaded = start;
      response.data.on('data', (chunk: Buffer) => {
        downloaded += chunk.length;
        if (spinner && totalLength) {
          spinner.text = `Downloading... ${(100 * downloaded / totalLength).toFixed(2)}%`;
        }
      });

      await pipeline(response.data, writer);

      await fs.move(tempPath, destPath, { overwrite: true });
    } catch (error) {
      if (spinner) {
        spinner.fail(`Download error: ${(error as Error).message}`);
      }
      throw error;
    }
  }

  async verifyChecksum(filePath: string, expectedChecksum: string): Promise<boolean> {
    if (!expectedChecksum) {
      // No checksum to verify, consider valid
      return true;
    }
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', data => {
        hash.update(data);
      });
      stream.on('end', () => {
        const digest = hash.digest('hex');
        resolve(digest === expectedChecksum.toLowerCase());
      });
      stream.on('error', err => reject(err));
    });
  }

  async extractArchive(archivePath: string, targetDir: string): Promise<void> {
    try {
      await decompress(archivePath, targetDir);
      if (process.platform === 'win32') {
        await this.phpIni(targetDir);
      }
    } catch (error) {
      logger.error(`Failed to extract archive: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Copie php.ini-production vers php.ini
   * @param dir Le chemin du dossier contenant les fichiers PHP ini
   */
  async phpIni(dir: string): Promise<void> {
    const source = path.join(dir, 'php.ini-production');
    const destination = path.join(dir, 'php.ini');

    try {
      const exists = await fs.pathExists(source);
      if (!exists) {
        throw new Error(`Fichier introuvable : ${source}`);
      }

      await fs.copy(source, destination);
      console.log(`\nFichier copié avec succès : ${destination}`);
    } catch (error) {
      console.error(`Erreur lors de la copie : ${(error as Error).message}`);
      throw error;
    }
  }

}
