const express = require("express");

const {
  createCourse,
  getCourses,
  getCourseById,
} = require("../controllers/courseController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Only admins can create courses
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createCourse
);

// Admins and teachers can view all courses
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  getCourses
);

// Admins and teachers can view a specific course
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  getCourseById
);

module.exports = router;