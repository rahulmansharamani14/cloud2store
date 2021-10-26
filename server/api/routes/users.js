const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const user_controller = require("../controller/user.controller");

router.get("/me", auth, user_controller.profile);

module.exports = router;
