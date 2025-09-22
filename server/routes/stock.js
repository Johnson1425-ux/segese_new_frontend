import express from 'express';
import {
  getStockItems,
  createStockItem,
  updateStockItem,
  deleteStockItem,
} from '../controllers/stockController.js';

const router = express.Router();

router.route('/').get(getStockItems).post(createStockItem);

router.route('/:id').put(updateStockItem).delete(deleteStockItem);

export default router;