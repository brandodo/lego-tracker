import { getProducts, getProductByCode } from '../models/product.js';
import { logger } from '../utils/logger.js';

export const getProductsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'name';
    const order = req.query.order?.toUpperCase() || 'ASC';
    
    const { products, total, totalPages } = await getProducts({ 
      page, 
      limit, 
      sortBy, 
      order 
    });

    res.json({
      status: 'success',
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch products' 
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { code } = req.params;
    const product = await getProductByCode(code);
    
    if (!product) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Product not found' 
      });
    }

    res.json({
      status: 'success',
      data: product
    });
  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch product' 
    });
  }
};
