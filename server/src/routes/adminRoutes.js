
const express = require("express");

const {
  createTeacher,
  getTeachers,
  assignCourseToTeacher,
  unassignCourseFromTeacher,
   linkStudentToParent,
} = require("../controllers/adminController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Admins can register teachers
router.post(
  "/teachers",
  authenticate,
  authorize("ADMIN"),
  createTeacher
);

// Admins can view all teachers and their courses
router.get(
  "/teachers",
  authenticate,
  authorize("ADMIN"),
  getTeachers
);

// Admins can assign a course to a teacher
router.patch(
  "/teachers/:teacherId/courses",
  authenticate,
  authorize("ADMIN"),
  assignCourseToTeacher
);

// Admins can remove a course from a teacher
router.patch(
  "/courses/:courseId/unassign",
  authenticate,
  authorize("ADMIN"),
  unassignCourseFromTeacher
);

// Admins can link a student to a parent
router.post(
  "/parents/:parentId/students",
  authenticate,
  authorize("ADMIN"),
  linkStudentToParent
);

module.exports = router;

