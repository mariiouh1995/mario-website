import fs from 'node:fs/promises';
const access = JSON.parse(await fs.readFile('.codex-local/access.json', 'utf8'));
async function vercel(path) {
  const response = await fetch(`https://api.vercel.com${path}`, { headers: { Authorization: `Bearer ${access.vercel}` } });
  const data = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${data.error?.message || 'Vercel request failed'}`);
  return data;
}
const projects = await vercel('/v9/projects?limit=100');
console.log(JSON.stringify(projects.projects.map(project => ({ id: project.id, name: project.name, accountId: project.accountId, repo: project.link?.repo, org: project.link?.org })), null, 2));
const project = projects.projects.find(project => project.link?.repo === 'mario-website' || /mario/.test(project.name));
if (project) {
  await fs.writeFile('.codex-local/project.json', JSON.stringify({ id: project.id, teamId: project.accountId, name: project.name }));
  const env = await vercel(`/v9/projects/${project.id}/env?teamId=${project.accountId}`);
  console.log('Configured environment keys:', env.envs.map(entry => ({ key: entry.key, target: entry.target, type: entry.type })));
}
