import express from 'express';
import {
  getInvoices,
  addInvoice,
  receiveItem,
} from '../controllers/itemReceivingController.js';

const router = express.Router();

router.route('/invoices').get(getInvoices).post(addInvoice);

router.route('/').post(receiveItem);

export default router;