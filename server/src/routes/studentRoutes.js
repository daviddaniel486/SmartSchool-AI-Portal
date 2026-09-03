const express = require("express");

const {
  getStudents,
  getStudentById,
  createStudent,
  assignStudentToClass,
  resetStudentPassword,
} = require("../controllers/studentController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin can create students
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createStudent
);

// Admin can assign a student to a class
router.patch(
  "/:id/class",
  authenticate,
  authorize("ADMIN"),
  assignStudentToClass
);
// Admin can reset a student's password
router.patch(
  "/:id/password",
  authenticate,
  authorize("ADMIN"),
  resetStudentPassword
);
// Admins and teachers can view all students
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  getStudents
);

// Admins and teachers can view a specific student
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  getStudentById
);

module.exports = router;