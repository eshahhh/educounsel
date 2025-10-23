import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req, res) => {
    res.json({ success: true, message: 'User api - tbd' });
});

export default router;
