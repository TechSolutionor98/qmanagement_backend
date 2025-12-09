import express from "express";
import { authenticateToken, authorize } from "../middlewares/auth.js";
import {
  getTicketInfoSessions,
  getReceptionistSessions,
  deleteSession
} from "../controllers/sessions/displayScreensSessions.js";

const router = express.Router();

// Get ticket_info sessions for admin
router.get("/ticket-info/:admin_id", authenticateToken, authorize("admin"), getTicketInfoSessions);

// Get receptionist sessions for admin
router.get("/receptionist/:admin_id", authenticateToken, authorize("admin"), getReceptionistSessions);

// Delete session by ID
router.delete("/:session_id", authenticateToken, authorize("admin"), deleteSession);

export default router;
