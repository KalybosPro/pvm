// Si c'est windows
export interface PhpReleasesJson {
  [majorVersion: string]: PhpReleaseVersion;
}

export interface PhpReleaseVersion {
  version: string;
  source: PhpFilePack;
  test_pack: PhpFilePackWithHash;
  [variant: string]: any; // For ts-vc15-x64, nts-vs16-x64, etc.
}

export interface PhpVariant {
  mtime: string;
  zip: PhpFilePackWithHash;
  debug_pack: PhpFilePackWithHash;
  devel_pack: PhpFilePackWithHash;
}

export interface PhpFilePack {
  path: string;
  size: string;
}

export interface PhpFilePackWithHash extends PhpFilePack {
  sha256: string | null;
}
// Fin si windows

// Si c'est linux, macOS, ...
export interface ManifestEntry {
  version: string;
  platforms: {
    [key: string]: {
      url: string;
      checksum: string;
      archiveType: 'zip' | 'tar.gz';
    };
  };
}
// Fin

// C'est pour le manifest.json
export interface Manifest {
  generatedAt: string;
  entries: ManifestEntry[];
}