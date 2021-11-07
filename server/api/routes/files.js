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

    //Upload to Azure Storage
    var startDate = new Date();
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 100);
    startDate.setMinutes(startDate.getMinutes() - 100);

    var sharedAccessPolicy = {
        AccessPolicy: {
            Permissions: azureStorage.BlobUtilities.SharedAccessPermissions.READ,
            Start: startDate,
            Expiry: expiryDate,
        },
    };

    let promise = new Promise(function (resolve, reject) {
        blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, (err) => {
            if (err) {
                res.status(500);
                res.json({
                    err,
                });
                reject(new Error({ msg: "It does not work" }));
            }

            var token = blobService.generateSharedAccessSignature(containerName, blobName, sharedAccessPolicy);
            var sasUrl = blobService.getUrl(containerName, blobName, token);

            console.log("sasUrl: " + sasUrl);
            //return sasUrl.toString();
            resolve({ downloadURL: sasUrl.toString() });
        });
    });
    promise
        .then(async (result) => {
            console.log("Success", result);
            //Add metadata to Mongodb
            try {
                const file = new File({
                    filename: req.file.originalname,
                    mimetype: req.file.mimetype,
                    downloadURl: result.downloadURL,
                });

                const filecreated = await file.save();

                const user = await User.findById(req.user["_id"]).exec();

                user.files.push(file);
                await user.save();

                console.log(file);
                console.log("File created: " + filecreated);

                res.json({
                    message: "File uploaded to Azure Blob storage.",
                });
            } catch (error) {
                console.log("error:", error);
                res.json({
                    error,
                });
                return;
            }
        })
        .catch((error) => {
            console.log("Error", error);
        });
});

module.exports = router;
