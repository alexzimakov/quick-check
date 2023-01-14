import { rm } from 'node:fs/promises';

const [, , dirPath] = process.argv;
(async () => {
  await rm(dirPath, { recursive: true, force: true });
})();
