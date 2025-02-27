import { pool } from "../config/db.js";
import { logger } from "../utils/logger.js";

const VALID_SORT_FIELDS = ["name", "price", "rating", "code"];
const VALID_ORDER_DIRECTIONS = ["ASC", "DESC"];

export const getProducts = async ({
  page = 1,
  limit = 10,
  sortBy = "name",
  order = "ASC",
}) => {
  try {
    // Validate sorting parameters
    const validatedSortBy = VALID_SORT_FIELDS.includes(sortBy)
      ? sortBy
      : "name";
    const validatedOrder = VALID_ORDER_DIRECTIONS.includes(order)
      ? order
      : "ASC";

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.query("SELECT COUNT(*) FROM products");
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const query = {
      text: `
        SELECT * FROM products
        ORDER BY ${validatedSortBy} ${validatedOrder}
        LIMIT $1 OFFSET $2
      `,
      values: [limit, offset],
    };

    const { rows: products } = await pool.query(query);

    return {
      products,
      total,
      totalPages,
    };
  } catch (error) {
    logger.error("Database query failed:", error);
    throw error;
  }
};

export const getProductByCode = async (code) => {
  try {
    const query = {
      text: "SELECT * FROM products WHERE code = $1",
      values: [code],
    };

    const { rows } = await pool.query(query);
    return rows[0] || null;
  } catch (error) {
    logger.error("Database query failed:", error);
    throw error;
  }
};

export const insertProducts = async (products) => {
  try {
    const values = products
      .map((_, index) => {
        const offset = index * 5;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${
          offset + 4
        }, $${offset + 5})`;
      })
      .join(",");

    const flatValues = products.flatMap((product) => [
      product.code,
      product.title,
      product.price,
      product.rating,
      product.image,
    ]);

    const query = {
      text: `
        INSERT INTO products (
          code,
          name,
          price,
          rating,
          url
        ) 
        VALUES ${values}
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          rating = EXCLUDED.rating,
          url = EXCLUDED.url
        RETURNING *;
      `,
      values: flatValues,
    };

    const { rows } = await pool.query(query);
    logger.info(`Successfully inserted/updated ${rows.length} products`);
    return rows;
  } catch (error) {
    logger.error("Database insertion failed:", error);
    throw error;
  }
};
