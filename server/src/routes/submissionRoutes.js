const express = require("express");

const {
  submitAssignment,
  getSubmissions,
  getSubmissionById,
  gradeSubmission,
  getMySubmissions,
} = require("../controllers/submissionController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Students can submit assignments
router.post(
  "/",
  authenticate,
  authorize("STUDENT"),
  submitAssignment
);
// Students can view their own submissions
router.get(
  "/my",
  authenticate,
  authorize("STUDENT"),
  getMySubmissions
);
// Admins and teachers can view submissions
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  getSubmissions
);


// Admins and teachers can view a specific submission
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  getSubmissionById
);



// Admins and teachers can grade submissions
router.patch(
  "/:id/grade",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  gradeSubmission
);

module.exports = router;