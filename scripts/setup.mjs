import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [resolve(root, 'scripts/preflight.mjs')], { stdio: 'inherit' });
const npmCli = process.env.npm_execpath;
if (npmCli) {
  execFileSync(process.execPath, [npmCli, 'ci'], { cwd: resolve(root, 'frontend'), stdio: 'inherit' });
} else {
  execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci'], {
    cwd: resolve(root, 'frontend'),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}
