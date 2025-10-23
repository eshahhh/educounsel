import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
    res.json({ success: true, message: 'University api - tbd' });
});

export default router;
