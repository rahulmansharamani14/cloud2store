const express = require("express");
const router = express.Router();

const files_controller = require("../controller/file.controller");
const auth = require("../middleware/auth");

router.post("/upload", function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.");
    }

    for (const item in req.files) {
        console.log(item.data);
    }

    //files_controller.uploadBlob(req.user._id);

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    // const sampleFile = req.files.sampleFile;

    console.log(req.files);

    // // Use the mv() method to place the file somewhere on your server
    // sampleFile.mv("/somewhere/on/your/server/filename.jpg", function (err) {
    //     if (err) return res.status(500).send(err);

    //     res.send("File uploaded!");
    // });
    res.json({ status: "success" });
});

//router.post("/upload", files_controller.uploadBlob);
router.get("/list", auth.ensureAuthenticated, files_controller.listBlob);

router.get("/upload", (req, res) => {
    res.send("all good");
});

module.exports = router;
