import { pool } from "./src/config/db.js";
import express from "express";
import routes from './src/routes/index.js';
import { initializeCronJobs } from "./src/services/cronService.js";
import { logger } from "./src/utils/logger.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

const initializeApp = async () => {
  try {
    // Test database connection
    const client = await pool.connect();
    client.release();
    logger.info("Database connection established successfully");

    // Initialize cron jobs
    initializeCronJobs();

    logger.info("Application initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize application:", error);
    process.exit(1);
  }
};

initializeApp();

app.get("/", async (req, res) => {
  const client = await pool.connect();

  const { rows: products } = await client.query("SELECT * FROM products");

  console.log(products, "PRODUCTS");

  res.send(products);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
