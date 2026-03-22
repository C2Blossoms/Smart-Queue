import type { Request, Response } from "express";
import { z } from "zod";
import * as TicketsService from "../services/tickets.service.js";

const joinQueueSchema = z.object({
  pax: z.coerce.number().int().positive().default(1),
});

export const getStatus = async (req: Request, res: Response) => {
  const status = await TicketsService.getStatus();
  res.json(status);
};

export const getHistory = async (req: Request, res: Response) => {
  const history = await TicketsService.getHistory();
  res.json(history);
};

export const getTicket = async (req: Request, res: Response) => {
  const ticket = await TicketsService.getTicket(req.params.id as string);
  if (!ticket) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }
  res.json(ticket);
};

export const joinQueue = async (req: Request, res: Response) => {
  const { pax } = joinQueueSchema.parse(req.body);
  const ticket = await TicketsService.joinQueue(pax);
  res.status(201).json({ message: "Queue joined successfully", ticket });
};
