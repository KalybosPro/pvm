import axios from "axios";
import logger from "./logger";
import os from "os";

export function validateVersionSyntax(version: string): boolean {
  const regex = /^[0-9]+\.[0-9]+\.[0-9]+$/;
  return regex.test(version);
}


/**
 * Récupère l'URL valide pour une version PHP donnée sur php.net ou museum.php.net (Windows inclus)
 * @param version Version PHP à vérifier (ex: "7.4.33")
 * @returns L'URL si trouvée, sinon null
 */
export async function getPhpDownloadUrl(version: string): Promise<string | null> {
  const platform = os.platform();
  const suffixes = [
    '.tar.gz',
    '.zip',
    '-Win32-vc15-x64.zip',
    '-Win32-vc15-x86.zip',
    '-Win32-vs16-x64.zip',
    '-Win32-vs16-x86.zip',
    '-Win32-vs17-x64.zip',
    '-Win32-vs17-x86.zip',
    '-nts-Win32-vc15-x64.zip',
    '-nts-Win32-vc15-x86.zip',
    '-nts-Win32-vs16-x64.zip',
    '-nts-Win32-vs16-x86.zip',
    '-nts-Win32-vs17-x64.zip',
    '-nts-Win32-vs17-x86.zip',
  ];

  let mirrors = ['https://windows.php.net/downloads/releases/archives/php-'];

  if (platform !== 'win32') {
    mirrors = ['https://www.php.net/distributions/php-', 'https://museum.php.net/php7/php-'];
  }

  for (const mirror of mirrors) {
    for (const suffix of suffixes) {
      const url = `${mirror}${version}${suffix}`;
      try {
        const response = await axios.head(url);
        if (response.status === 200) {
          return url;
        }
      } catch (error) {
        // Ignore 404 and continue
        if (axios.isAxiosError(error) && error.response?.status !== 404) {
          console.error(`Erreur lors de la vérification de l'URL: ${url}`, error.message);
        }
      }
    }
  }

  logger.error(`Version PHP ${version} introuvable sur php.net, museum.php.net ou windows.php.net`);
  return null;
}

/**
 * Retourne la version complète en x.y.z.
 * Si x.y est donné, récupère la dernière version patch disponible.
 */
export async function getFullVersion(version: string): Promise<string> {

  const parts = version.split('.');

  if (parts.length === 3) {
    // x.y.z donné directement
    return version;
  }

  // x.y donné : récupérer la dernière version patch en ligne
  const majorMinor = version;

  try {
    // 🔧 Exemple avec php.net releases API (adapte si besoin)
    const response = await axios.get('https://www.php.net/releases/index.php?json');
    const data = response.data;

    // Récupérer toutes les versions commençant par majorMinor
    const matchingVersions = Object.keys(data)
      .filter(v => v.startsWith(majorMinor + '.'))
      .sort((a, b) => compareVersions(b, a)); // tri décroissant

    if (matchingVersions.length > 0) {
      return matchingVersions[0]; // dernière version patch
    } else {
      logger.error(`Aucune version trouvée pour ${majorMinor}`);
      return `${majorMinor}.0`;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des versions:', (error as Error).message);
    return `${majorMinor}.0`;
  }
}

/**
 * Compare deux versions x.y.z
 */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) {
      return pa[i] - pb[i];
    }
  }
  return 0;
}
