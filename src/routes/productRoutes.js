import express from 'express';
import { getProductsList, getProduct } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProductsList);
router.get('/:code', getProduct);

export default router;