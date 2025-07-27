import os from 'os';
import fs from 'fs-extra';

export interface PlatformInfo {
  os: string;
  arch: string;
  distro?: string;
}

export function detectPlatform(): PlatformInfo {
  const platform = os.platform();
  let arch = os.arch();

  if (arch === 'x64') arch = 'x64';
  else if (arch === 'arm64') arch = 'arm64';
  else if (arch === 'x86') arch = 'x86';
  else arch = 'x64'; // default fallback

  let distro: string | undefined = undefined;

  if (platform === 'linux') {
    // Try to detect distro
    try {
      const osRelease = fs.readFileSync('/etc/os-release', 'utf-8');
      const match = osRelease.match(/^ID=(.+)$/m);
      if (match) {
        distro = match[1].replace(/"/g, '');
      }
    } catch {
      // ignore
    }
  }
  return { os: platform, arch, distro };
}
