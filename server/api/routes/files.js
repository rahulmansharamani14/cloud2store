const express = require("express");
const router = express.Router();

const files_controller = require("../controller/file.controller");
const auth = require("../middleware/auth");

const File = require("../models/file");
const User = require("../models/user");

const { upload } = require("../middleware/upload");

router.post("/upload", upload.single("myFile"), async (req, res) => {
    console.log(req.file);
    try {
        // const newFile = await File.create({
        //     filename: req.file.filename,
        //     filepath: req.file.path,
        //     mimetype: req.file.mimetype,
        // });
        // res.status(200).json({
        //     status: "success",
        //     message: "File created successfully!!",
        // });

        const file = new File({
            filename: req.file.filename,
            filepath: req.file.path,
            mimetype: req.file.mimetype,
        });

        console.log(file);

        const filecreated = await file.save();

        const user = await User.findById(req.user["_id"]).exec();

        user.files.push(file);
        await user.save();

        console.log("File created: " + filecreated);

        res.status(200).json({
            status: "success",
            message: "File created successfully!!",
            filecreated: filecreated,
        });
    } catch (error) {
        res.json({
            error,
        });
    }
});

router.get("/getFiles", async (req, res) => {
    try {
        const files = await User.findById(req.user["_id"]).populate("files").exec();

        // const files = await File.find();
        res.status(200).json({
            status: "success",
            files,
        });
    } catch (error) {
        res.json({
            status: "Fail",
            error,
        });
    }
});

//router.post("/upload", files_controller.uploadBlob);
router.get("/list", auth.ensureAuthenticated, files_controller.listBlob);

router.get("/upload", (req, res) => {
    res.send("all good");
});

module.exports = router;
