import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  const client = await pool.connect();
  try {
    // Read and execute schema SQL
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'mgnrega_schema.sql'),
      'utf8'
    );
    await client.query(schemaSQL);
    console.log('✅ Database schema created successfully');

    // Import initial data from API
    const { syncData } = await import('../services/dataSyncService.js');
    await syncData();
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    client.release();
  }
}

// Run setup if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupDatabase().then(() => process.exit(0));
}

export { setupDatabase };