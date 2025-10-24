import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { uploadSingle, handleMulterError } from '../middleware/upload';
import {
    getDocuments,
    getDocumentById,
    uploadDocument,
    updateDocument,
    deleteDocument,
} from '../controllers/document.controller';
import {
    createDocumentSchema,
    updateDocumentSchema,
    getDocumentByIdSchema,
} from '../validators/document.validator';

const router = Router();

// Get all documents
router.get('/', authenticate, getDocuments);

// Get document by ID
router.get('/:id', authenticate, validate(getDocumentByIdSchema), getDocumentById);

// Upload document
router.post(
    '/',
    authenticate,
    uploadSingle('file'),
    handleMulterError,
    validate(createDocumentSchema),
    uploadDocument
);

// Update document
router.put(
    '/:id',
    authenticate,
    validate(updateDocumentSchema),
    updateDocument
);

// Delete document
router.delete('/:id', authenticate, deleteDocument);

export default router;
