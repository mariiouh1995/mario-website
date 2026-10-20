import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const access = JSON.parse(await fs.readFile('.codex-local/access.json', 'utf8'));
const result = spawnSync('git', process.argv.slice(2), {
  stdio: 'inherit',
  env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader', GIT_CONFIG_VALUE_0: 'AUTHORIZATION: basic ' + Buffer.from('x-access-token:' + access.github).toString('base64') },
});
process.exitCode = result.status || 0;
