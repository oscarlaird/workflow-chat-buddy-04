
// Simple version tracking system

export interface Version {
  major: number;
  minor: number;
  patch: number;
}

// Current version - manually updated
const APP_VERSION: Version = {
  major: 0,
  minor: 1,
  patch: 1
};

// Format the version as a string
export const formatVersion = (version: Version): string => {
  return `v${version.major}.${version.minor}.${version.patch}`;
};

// Get the current version
export const getCurrentVersion = (): Version => {
  return APP_VERSION;
};
