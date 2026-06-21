export const FOLDER_ACCESS = {
  'f-sop':      ['admin', 'member', 'viewer'],
  'f-manuals':  ['admin', 'member'],
  'f-partner':  ['admin', 'member'],
  'f-onboard':  ['admin', 'member', 'viewer'],
  'f-internal': ['admin'],
};

export const canAccess = (role, folderId) =>
  FOLDER_ACCESS[folderId]?.includes(role) ?? false;
