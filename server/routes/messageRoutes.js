
import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getMessages,
  getUserForSidebar,
  markMessageAsSeen,
  sendMessage
} from "../controllers/messageController.js";

const messageRouter = express.Router();

// Get users for sidebar
messageRouter.get("/users", protectRoute, getUserForSidebar);

// Get all messages for a selected user
messageRouter.get("/:id", protectRoute, getMessages);

// Mark a message as seen
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);

// Send a message
messageRouter.post("/send/:id", protectRoute, sendMessage);

export default messageRouter;
