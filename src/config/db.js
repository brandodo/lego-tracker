import pkg from "pg";

const { Pool } = pkg;

console.log(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_PASSWORD,
  process.env.POSTGRES_USER,
  "POSTGRES DATA"
);
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

// Test the connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Database connected successfully!");
    client.release();
  } catch (err) {
    console.error("Database connection error:", err.stack);
  }
};

// Optional: Initialize your tables
const initializeDatabase = async () => {
  try {
    let client = await pool.connect();

    await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          code VARCHAR(10) UNIQUE,
          name VARCHAR(255),
          price DECIMAL(10,2),
          rating DECIMAL(3, 2),
          url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

    
    console.log("Tables initialized successfully!");
  } catch (err) {
    console.error("Error initializing tables:", err.stack);
  }
};

export { pool, testConnection, initializeDatabase };
