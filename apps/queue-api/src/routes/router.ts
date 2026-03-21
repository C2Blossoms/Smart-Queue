import { Router } from 'express';
import ticketsRouter from './tickets.router.js';
import staffRouter from './staff.router.js';

const router = Router();

router.use('/tickets', ticketsRouter);

router.use('/queue', staffRouter);

export default router;
