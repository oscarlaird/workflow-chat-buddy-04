
// This is a simple version tracking system
// The version follows semantic versioning (major.minor.patch)

export interface Version {
  major: number;
  minor: number;
  patch: number;
}

// Initial version
const initialVersion: Version = {
  major: 0,
  minor: 1,
  patch: 0
};

// Get the current version from localStorage or use initial version
export const getCurrentVersion = (): Version => {
  const storedVersion = localStorage.getItem('app_version');
  return storedVersion ? JSON.parse(storedVersion) : initialVersion;
};

// Save the version to localStorage
export const saveVersion = (version: Version): void => {
  localStorage.setItem('app_version', JSON.stringify(version));
};

// Format the version as a string
export const formatVersion = (version: Version): string => {
  return `v${version.major}.${version.minor}.${version.patch}`;
};

// Bump the patch version
export const bumpPatchVersion = (): Version => {
  const currentVersion = getCurrentVersion();
  const newVersion = {
    ...currentVersion,
    patch: currentVersion.patch + 1
  };
  saveVersion(newVersion);
  return newVersion;
};

// Bump the minor version (resets patch)
export const bumpMinorVersion = (): Version => {
  const currentVersion = getCurrentVersion();
  const newVersion = {
    ...currentVersion,
    minor: currentVersion.minor + 1,
    patch: 0
  };
  saveVersion(newVersion);
  return newVersion;
};

// Bump the major version (resets minor and patch)
export const bumpMajorVersion = (): Version => {
  const currentVersion = getCurrentVersion();
  const newVersion = {
    major: currentVersion.major + 1,
    minor: 0,
    patch: 0
  };
  saveVersion(newVersion);
  return newVersion;
};
