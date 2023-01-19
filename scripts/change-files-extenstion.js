import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs/promises';

(async function main() {
  const args = parseCLIArgs();
  await renameFiles(args.dir, args.from, args.to);
})();

async function renameFiles(dirPath, from, to) {
  const dir = await fs.readdir(dirPath, { withFileTypes: true });
  for await (const file of dir) {
    const filePath = path.join(dirPath, file.name);

    if (file.isFile()) {
      const ext = path.extname(file.name);
      if (ext === from) {
        const fileBasename = path.basename(file.name, from);
        const fileName = fileBasename + to;
        const newFilePath = path.join(dirPath, fileName);
        await fs.rename(filePath, newFilePath);
      }
    } else if (file.isDirectory()) {
      await renameFiles(filePath, from, to);
    }
  }
}

function parseCLIArgs() {
  let dir = '';
  let from = '';
  let to = '';

  const args = process.argv;
  for (let i = 0; i < args.length; i += 1) {
    const name = (args[i] || '').trim();
    const value = (args[i + 1] || '').trim();
    if (name === '--dir') {
      dir = value;
    } else if (name === '--from') {
      from = value;
    } else if (name === '--to') {
      to = value;
    }
  }

  assert(dir, '`--dir` argument is required');
  assert(from, '`--from` argument is required');
  assert(to, '`--to` argument is required');

  return { dir, from, to };
}
