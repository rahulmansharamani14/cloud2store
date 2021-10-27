const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    console.log("GET index");
    res.render("index");
});

router.use("/users", require("./users"));
router.use("/auth", require("./auth"));
router.use("/file", require("./files"));

module.exports = router;
