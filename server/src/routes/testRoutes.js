const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/protected", authenticate, (req, res) => {
  res.json({
    success: true,
    message: "You accessed a protected route",
    user: req.user,
  });
});

router.get("/admin-only", authenticate, authorize("ADMIN"), (req, res) => {
  res.json({
    success: true,
    message: "You accessed an admin-only route",
    user: req.user,
  });
});

module.exports = router;