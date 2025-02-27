import { startBrowser } from "../config/browser.js";
import { insertProducts } from "../models/product.js";
import { logger } from "../utils/logger.js";

const BASE_URL = "https://www.lego.com/en-ca/categories/all-sets";

export const scrapeProducts = async () => {
  let browser;
  try {
    browser = await startBrowser();
    const page = await browser.newPage();
    await page.goto(BASE_URL);
    await page.setViewport({ width: 1080, height: 1024 });
    const allProducts = [];

    const totalPages = await page.$eval(
      'div[data-test="pagination"] > nav > div > a:last-of-type',
      (el) => el.innerText
    );

    logger.info("Starting product scrape");

    for (let i = 1; i <= totalPages; i++) {
      await page.goto(
        `https://www.lego.com/en-ca/categories/all-sets?page=${i}`
      );
      await page.waitForSelector('[data-test="product-item"]');

      const products = await page.$$eval('[data-test="product-item"]', (sets) =>
        sets
          .map((s) => {
            const code = s
              .querySelector('[data-test="product-leaf"]')
              ?.getAttribute("data-test-key");

            const title = s.querySelector(
              '[data-test="product-leaf-title"]'
            )?.innerText;

            const image = s.querySelector(
              '[data-test="product-leaf-image-link"]'
            )?.href;

            const price = s
              .querySelector('[data-test="product-leaf-price"]')
              ?.innerText.split(" ")[0];

            const pieces = s.querySelector(
              '[data-test="product-leaf-piece-count-label"]'
            )?.innerText;

            const rating = s.querySelector(
              '[data-test="product-leaf-rating-label"]'
            )?.innerText;

            if (title && price && pieces) {
              return {
                code,
                title,
                image,
                price,
                pieces,
                rating,
              };
            }

            return null;
          })
          .filter(Boolean)
      );

      allProducts.push(...products);
    }

    logger.info(`Scraped ${allProducts.length} products`);

    // Insert into database
    const savedProducts = await insertProducts(allProducts);

    return savedProducts;
  } catch (error) {
    logger.error("Scraping failed:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
