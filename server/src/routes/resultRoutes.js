const express = require("express");

const {
  createResult,
  getStudentResults,
  getMyResults,
  updateResult,
  publishResult,
  getStudentGPA,
  getMyGPA,
  getTeacherResults,
} = require("../controllers/resultController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

/*
 * Create a result
 * ADMIN and TEACHER
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  createResult
);

/*
 * Get logged-in student's results
 */
router.get(
  "/me",
  authenticate,
  authorize("STUDENT"),
  getMyResults
);

router.get("/me/gpa", authenticate, authorize("STUDENT"), getMyGPA);

/*
 * Get results for a specific student
 */
router.get(
  "/teacher",
  authenticate,
  authorize("TEACHER"),
  getTeacherResults
);
router.get(
  "/student/:studentId",
  authenticate,
  authorize("ADMIN", "TEACHER", "PARENT"),
  getStudentResults
);

/*
 * Get GPA for a specific student
 */
router.get(
  "/student/:studentId/gpa",
  authenticate,
  authorize("ADMIN", "TEACHER", "PARENT"),
  getStudentGPA
);

/*
 * Update a result
 */
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  updateResult
);

/*
 * Publish a result
 */
router.patch(
  "/:id/publish",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  publishResult
);

module.exports = router;