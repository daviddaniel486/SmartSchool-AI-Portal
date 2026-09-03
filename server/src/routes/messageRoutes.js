const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
  getContacts,
  sendMessage,
  getInbox,
  getSentMessages,
  markMessageRead,
} = require("../controllers/messageController");

const router = express.Router();

router.use(authenticate);

router.get("/contacts", getContacts);

router.get("/inbox", getInbox);

router.get("/sent", getSentMessages);

router.post("/", sendMessage);

router.patch("/:id/read", markMessageRead);

module.exports = router;