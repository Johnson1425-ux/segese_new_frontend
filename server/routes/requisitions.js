import express from 'express';
import {
  getRequisitions,
  createRequisition,
  updateRequisition,
} from '../controllers/requisitionController.js';

const router = express.Router();

router.route('/').get(getRequisitions).post(createRequisition);
router.route('/:id').put(updateRequisition);

export default router;