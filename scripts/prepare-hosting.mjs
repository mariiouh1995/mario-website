import fs from 'node:fs/promises';
const access = JSON.parse(await fs.readFile('.codex-local/access.json', 'utf8'));
const project = JSON.parse(await fs.readFile('.codex-local/project.json', 'utf8'));
await fs.mkdir('.vercel', { recursive: true });
await fs.writeFile('.vercel/project.json', JSON.stringify({ projectId: project.id, orgId: project.teamId, projectName: project.name }));
console.log(`Linked local checkout to existing project ${project.name}. Use vercel env pull for decrypted environment values.`);
