import type { Request, Response } from 'express';
import * as StaffService from '../services/staff.service.js';

export const callNext = async (req: Request, res: Response) => {
  const ticket = await StaffService.callNext();
  
  if (!ticket) {
    res.status(404);
    throw new Error("No waiting tickets");
  }
  
  res.json({ message: "Call next success", ticket });
};

export const completeTicket = async (req: Request, res: Response) => {
  const { id } = req.params;
  await StaffService.completeTicket(Number(id));
  res.json({ message: `Ticket ${id} completed` });
};

export const skipTicket = async (req: Request, res: Response) => {
  const { id } = req.params;
  await StaffService.skipTicket(Number(id));
  res.json({ message: `Ticket ${id} skipped` });
};
