import express from 'express';
import * as TicketsController from '../controllers/tickets.controller.js';

const router = express.Router();

router.get('/status', TicketsController.getStatus);

router.get('/history', TicketsController.getHistory);

router.post('/join', TicketsController.joinQueue);

export default router;
