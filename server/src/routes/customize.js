import express from 'express';
import { renderPreview, generatePDFDownload, saveCustomization } from '../controllers/customizeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/preview', renderPreview);
router.post('/pdf', generatePDFDownload);
router.post('/save', protect, saveCustomization);

export default router;
