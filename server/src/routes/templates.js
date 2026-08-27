import express from 'express';
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getCategoryStats,
} from '../controllers/templateController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTemplates);
router.get('/categories/stats', getCategoryStats);
router.get('/:id', getTemplate);
router.post('/', protect, adminOnly, createTemplate);
router.put('/:id', protect, adminOnly, updateTemplate);
router.delete('/:id', protect, adminOnly, deleteTemplate);

export default router;
