import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
const access = JSON.parse(await fs.readFile('.codex-local/access.json', 'utf8'));
const child = spawn('npx.cmd', ['--yes', '--package', 'vercel@64.7.0', 'vercel', ...process.argv.slice(2)], { stdio: 'inherit', shell: true, windowsHide: true, env: { ...process.env, VERCEL_TOKEN: access.vercel } });
child.on('exit', code => process.exitCode = code ?? 1);
