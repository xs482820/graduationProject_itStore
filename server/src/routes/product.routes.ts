import { Router } from 'express';
import { getProducts, getProductById, createProduct, deleteProduct } from '../controllers/product.controller'; 

const router = Router();

// GET /api/products
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct); 
router.delete('/:id', deleteProduct);

export default router;
