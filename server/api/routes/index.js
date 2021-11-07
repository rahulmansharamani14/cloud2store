const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    console.log("GET index");
    res.render("pages/index");
});

router.get("/cp", (req, res) => {
    console.log("GET profile");
    res.render("pages/profile");
});

router.use("/", require("./users"));
router.use("/auth", require("./auth"));
router.use("/", require("./files"));

module.exports = router;
