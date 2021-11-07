require("dotenv").config();
const express = require("express");
const router = express.Router();

const multer = require("multer"),
    inMemoryStorage = multer.memoryStorage(),
    uploadStrategy = multer({ storage: inMemoryStorage }).single("myFile"),
    azureStorage = require("azure-storage"),
    blobService = azureStorage.createBlobService(),
    getStream = require("into-stream");

//const files_controller = require("../controller/file.controller");
const auth = require("../middleware/auth");

const File = require("../models/file");
const User = require("../models/user");

//const { upload } = require("../middleware/upload");

// router.post("/upload", upload.single("myFile"), async (req, res) => {
//     console.log(req.file);
//     try {
//         const file = new File({
//             filename: req.file.filename,
//             filepath: req.file.path,
//             mimetype: req.file.mimetype,
//         });

//         console.log(file);

//         const filecreated = await file.save();

//         const user = await User.findById(req.user["_id"]).exec();

//         user.files.push(file);
//         await user.save();

//         console.log("File created: " + filecreated);

//         res.status(200).json({
//             status: "success",
//             message: "File created successfully!!",
//             filecreated: filecreated,
//         });
//     } catch (error) {
//         res.json({
//             error,
//         });
//     }
// });

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

const getBlobName = (originalName) => {
    const identifier = Math.random().toString().replace(/0\./, ""); // remove "0." from start of string
    return `${identifier}-${originalName}`;
};

router.post("/upload", uploadStrategy, async (req, res) => {
    console.log(req.file);

    const containerName = req.user["_id"].toString();
    const blobName = getBlobName(req.file.originalname),
        stream = getStream(req.file.buffer),
        streamLength = req.file.buffer.length;

    console.log("containerName: " + containerName + typeof containerName);

    try {
        const file = new File({
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            downloadURl: `https://${process.env.account}.blob.core.windows.net/${containerName}/${blobName}`,
        });

        const filecreated = await file.save();

        const user = await User.findById(req.user["_id"]).exec();

        user.files.push(file);
        await user.save();

        console.log(file);
        console.log("File created: " + filecreated);
    } catch (error) {
        console.log("error:", error);
        res.json({
            error,
        });
        return;
    }

    blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, (err) => {
        if (err) {
            res.status(500);
            res.json({
                err,
            });
            return;
        }

        res.json({
            message: "File uploaded to Azure Blob storage.",
        });
    });
});

module.exports = router;
