import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
const access = JSON.parse(await fs.readFile('.codex-local/access.json', 'utf8'));
const child = spawn('npx.cmd', ['--yes', '--package', 'vercel', 'vercel', '--token', access.vercel, ...process.argv.slice(2)], { stdio: 'inherit', shell: true, windowsHide: true });
child.on('exit', code => process.exitCode = code ?? 1);
