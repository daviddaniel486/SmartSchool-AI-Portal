const express = require("express");

const {
  getUsers,
  getUserById,
} = require("../controllers/userController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin-only user management
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  getUsers
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  getUserById
);

module.exports = router;