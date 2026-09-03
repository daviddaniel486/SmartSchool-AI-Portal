
const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getMyProfile,
  getMyChildren,
} = require("../controllers/parentController");

const router = express.Router();



// Parent profile
router.get(
  "/me",
  authenticate,
  authorize("PARENT"),
  getMyProfile
);

// Parent's children
router.get(
  "/me/children",
  authenticate,
  authorize("PARENT"),
  getMyChildren
);


module.exports = router;

