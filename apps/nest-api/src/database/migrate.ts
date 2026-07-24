import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is required to run migrations');
}

const client = postgres(databaseUrl, { max: 1, prepare: false });
const database = drizzle(client);

async function runMigrations(): Promise<void> {
	try {
		await migrate(database, { migrationsFolder: './src/database/migrations' });
		console.log('Database migrations applied (drizzle migrator finished successfully).');
	} finally {
		await client.end();
	}
}

void runMigrations().catch((error: unknown) => {
	console.error('Database migration failed:', error);
	process.exit(1);
});
