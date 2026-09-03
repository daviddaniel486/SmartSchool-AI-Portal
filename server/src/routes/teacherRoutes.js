const express = require("express");

const {
  createTeacher,
  getTeachers,
  getTeacherById,
} = require("../controllers/teacherController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Only admins can create teachers
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createTeacher
);

// Admins and teachers can view all teachers
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  getTeachers
);

// Admins and teachers can view a specific teacher
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  getTeacherById
);

module.exports = router;