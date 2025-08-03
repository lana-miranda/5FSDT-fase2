import { Client } from 'pg';
import logger from 'jet-logger';

let client: Client | undefined = undefined;

async function connectPostgres() {
  try {
    if (!client) {
      const config = {
        user: String(process.env.POSTGRES_USER) || '',
        password: String(process.env.POSTGRES_PASSWORD) || '',
        host: String(process.env.POSTGRES_HOST) || '',
        port: Number(process.env.POSTGRES_PORT) || 5432,
        database: String(process.env.POSTGRES_DB) || '',
      };

      client = new Client(config);
      await client.connect();
    }

    return client;
  } catch (error) {
    logger.err(`Error initializing Postgres client: ${error}`);
    throw error;
  }
}

export default connectPostgres;
