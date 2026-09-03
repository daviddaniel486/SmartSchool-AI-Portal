const express = require("express");

const {
  createClass,
  getClasses,
  getClassById,
  assignTeacherToClass,
} = require("../controllers/classController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Admins can create classes
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createClass
);

// Admins and teachers can view classes
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  getClasses
);

// Admins and teachers can view a specific class
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  getClassById
);

// Admins can assign teachers to classes
router.patch(
  "/:id/teacher",
  authenticate,
  authorize("ADMIN"),
  assignTeacherToClass
);

module.exports = router;
