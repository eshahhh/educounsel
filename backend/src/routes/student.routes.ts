import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
    getStudents,
    getStudentById,
    updateStudentProfile,
    deleteStudent,
    getStudentApplications,
    getStudentDocuments,
    getStudentDashboard,
} from '../controllers/student.controller';
import {
    updateStudentProfileSchema,
    getStudentByIdSchema,
} from '../validators/student.validator';

const router = Router();

// Get all students (admin/counselor only)
router.get('/', authenticate, authorize('admin', 'counselor'), getStudents);

// Get student by ID
router.get('/:id', authenticate, validate(getStudentByIdSchema), getStudentById);

// Update student profile
router.put(
    '/:id',
    authenticate,
    validate(updateStudentProfileSchema),
    updateStudentProfile
);

// Delete student (admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteStudent);

// Get student applications
router.get('/:id/applications', authenticate, getStudentApplications);

// Get student documents
router.get('/:id/documents', authenticate, getStudentDocuments);

// Get current student's dashboard (authenticated student)
router.get('/me/dashboard', authenticate, getStudentDashboard);

// Get student dashboard by student id (admin/counselor or direct lookup)
router.get('/:id/dashboard', authenticate, getStudentDashboard);

export default router;
