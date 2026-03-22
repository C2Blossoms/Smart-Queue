import express from "express";
import * as StaffController from "../controllers/staff.controller.js";

const router = express.Router();

router.get("/active", StaffController.getActive);

router.post("/call-next", StaffController.callNext);

router.put("/:id/complete", StaffController.completeTicket);

router.put("/:id/skip", StaffController.skipTicket);

export default router;
