import pgPromise from 'pg-promise';

const pgp = pgPromise();

const connection = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const db = pgp(connection);

export default db;