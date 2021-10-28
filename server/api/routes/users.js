const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const user_controller = require("../controller/user.controller");

router.get("/profile", auth.ensureAuthenticated, user_controller.profile); // GET /profile

module.exports = router;
