const express = require("express");

const {
  enrollStudent,
  getEnrollments,
} = require("../controllers/enrollmentController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Only admins can enroll students
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  enrollStudent
);

// Admins and teachers can view enrollments
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  getEnrollments
);

module.exports = router;