import { createPool } from 'mysql2/promise';

export default createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'warden',
  charset: 'utf8mb4_general_ci',
  namedPlaceholders: true,
  trace: false,
});
