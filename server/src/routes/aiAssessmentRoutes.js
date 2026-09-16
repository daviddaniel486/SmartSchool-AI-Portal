const express = require("express");
const { assessWithAI } = require("../controllers/aiAssessmentController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/assess",
  authenticate,
  authorize("STUDENT"),
  assessWithAI
);

module.exports = router;
