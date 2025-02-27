import cron from 'node-cron';
import { scrapeProducts } from './scraperService.js';
import { logger } from '../utils/logger.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

const runScraper = async (retryCount = 0) => {
  try {
    logger.info('Starting scheduled scrape');
    const products = await scrapeProducts();
    logger.info(`Scrape completed successfully. Updated ${products.length} products`);
    return products;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      logger.error(`Attempt ${retryCount + 1} failed, retrying...`, error);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return runScraper(retryCount + 1);
    }
    logger.error(`Scrape failed after ${MAX_RETRIES} attempts`, error);
    throw error;
  }
};

export const initializeCronJobs = () => {
  // Run every day at 3 AM
  cron.schedule('0 3 * * *', runScraper);
  logger.info('Cron jobs initialized');
  
  // Run immediately in development
  if (process.env.NODE_ENV === 'development') {
    runScraper();
  }
};