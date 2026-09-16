const express = require("express");

const {
  getStudentInsight,
  chatWithStudentAI,
} = require("../controllers/aiStudentController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/insights",
  authenticate,
  authorize("STUDENT"),
  getStudentInsight
);

router.post(
  "/student/chat",
  authenticate,
  authorize("STUDENT"),
  chatWithStudentAI
);

module.exports = router;