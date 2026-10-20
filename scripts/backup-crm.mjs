import fs from 'node:fs/promises';
import postgres from 'postgres';
const db = postgres(process.env.MARIO_DATABASE_URL, { ssl: 'require', prepare: false, max: 1, connect_timeout: 15 });
try {
  const tables = await db`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'mario_%'`;
  const backup = {};
  for (const { tablename } of tables) backup[tablename] = await db`SELECT * FROM ${db(tablename)}`;
  await fs.mkdir('backups/database', { recursive: true });
  const filename = `backups/database/crm-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  await fs.writeFile(filename, JSON.stringify(backup));
  console.log('CRM backup completed:', Object.fromEntries(Object.entries(backup).map(([key, rows]) => [key, rows.length])));
} finally { await db.end(); }
