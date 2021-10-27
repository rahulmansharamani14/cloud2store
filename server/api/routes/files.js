const express = require("express");
const router = express.Router();

const files_controller = require("../controller/file.controller");
const auth = require("../middleware/auth");

router.post("/upload", files_controller.uploadBlob);

router.get("/list", auth, files_controller.listBlob);

module.exports = router;
