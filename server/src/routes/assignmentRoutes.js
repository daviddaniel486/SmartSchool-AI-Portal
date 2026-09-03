const express = require("express");

const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  getMyAssignments,
} = require("../controllers/assignmentController");


const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Admins and teachers can create assignments
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  createAssignment
);

// Admins, teachers, and students can view assignments
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER", "STUDENT"),
  getAssignments
);
// Students can view assignments for their enrolled courses
router.get(
  "/my",
  authenticate,
  authorize("STUDENT"),
  getMyAssignments
);
// Admins, teachers, and students can view a specific assignment
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "TEACHER", "STUDENT"),
  getAssignmentById
);

module.exports = router;