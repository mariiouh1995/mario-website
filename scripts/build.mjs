import { spawnSync } from 'node:child_process';
for (const args of [['build'], ['build', '--ssr', 'src/entry-server.tsx', '--outDir', 'dist-server']]) {
  const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', ...args], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
