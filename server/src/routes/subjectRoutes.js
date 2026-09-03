const express = require("express");

const {
  createSubject,
  getSubjects,
  getSubjectById,
} = require("../controllers/subjectController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Only admins can create subjects
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createSubject
);

// Admins and teachers can view all subjects
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  getSubjects
);

// Admins and teachers can view a specific subject
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  getSubjectById
);

module.exports = router;