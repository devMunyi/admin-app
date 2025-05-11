import 'dotenv/config';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';

// Create the connection pool
const poolConnection = mysql.createPool({
    uri: process.env.DATABASE_URL,
    // Optional: Add additional connection pool options
    connectionLimit: 10,
    waitForConnections: true,
});

// Initialize Drizzle with the schema
const db = drizzle(poolConnection, {
    schema,
    mode: 'default' // or 'planetscale' if using PlanetScale
});

export default db;