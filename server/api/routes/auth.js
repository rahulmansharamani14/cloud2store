const express = require("express");
const router = express.Router();

const auth = require("../controller/auth.controller");

router.post("/login", auth.login); // POST /login
router.post("/register", auth.register); //POST /register

module.exports = router;
