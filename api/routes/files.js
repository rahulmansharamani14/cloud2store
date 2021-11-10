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

const fileController = require("../controller/file.controller");
const { hash_file } = require("../functions/hash");

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

router.get("/getSASUrl/:filename", auth.ensureAuthenticated, async (req, res, next) => {
    // fileName passed by client in req body
    console.log(req.params.filename);
    const containerName = req.user["_id"].toString();
    const sas_url = await fileController.getSASUrl(containerName, req.params.filename);
    res.json({
        success: true,
        url: sas_url,
    });
});

router.post("/upload", uploadStrategy, async (req, res) => {
    const containerName = req.user["_id"].toString();
    const blobName = req.file.originalname,
        stream = getStream(req.file.buffer),
        streamLength = req.file.buffer.length;

    console.log(req.file);
    console.log("containerName: " + containerName);

    const status = {
        msg: "",
        state: true,
    };

    //Generate MD5 Hash for filreq.file.buffere
    const hashedvalue = hash_file(req.file.buffer);

    console.log("hashedvalue: ", hashedvalue);

    //Check if the filename has already been in the db
    const checksamefile = await File.findOne({ filename: req.file.originalname, user_id: req.user["_id"].toString() }).exec();

    console.log("checksamefile: ", checksamefile, typeof checksamefile);

    if (checksamefile !== null) {
        //file name is matched

        const versions = checksamefile.versions;
        console.log("versions: ", versions);
        const count = versions.length;

        for (var i = 0; i < versions.length; i++) {
            console.log(versions[i].hashedvalue);
            if (hashedvalue === versions[i].hashedvalue) {
                console.log("Files have same hash");

                status.state = false;
                break;
            }
        }

        console.log("state: " + status.state);

        if (status.state === false) {
            status.msg = "file version are matched";

            return res.redirect("/profile?state=" + status.state + "&msg=" + status.msg);
        } else {
            //updatedblobname
            //Upload this version file to the storage
            const versionId = await fileController.uploadFile(containerName, blobName, req.file.buffer);

            // file version is not matched, assign a new version
            await File.updateOne({ filename: req.file.originalname, user_id: req.user["_id"].toString() }, { $push: { versions: { hashedvalue, version: count, versionId } } });

            status.msg = "New version of file is uploaded";
            status.state = true;

            res.redirect("/profile?state=" + status.state + "&msg=" + status.msg);
        }
    } else {
        //if no file version is matched, upload a new file to Azure Storage
        const versionId = await fileController.uploadFile(containerName, blobName, req.file.buffer);
        //const getMetaData = fileController.getMetaDataOnBlob(containerName, blobName);
        const downloadURL = await fileController.getSASUrl(containerName, blobName);

        status.msg = "New file with version 0 is uploaded";
        status.state = true;

        // Add to Mongodb
        try {
            const file = new File({
                filename: req.file.originalname,
                mimetype: req.file.mimetype,
                downloadURL: downloadURL,
                user_id: req.user["_id"].toString(),
                versions: { hashedvalue: hashedvalue, version: 0, versionId: versionId },
            });

            await file.save();

            const user = await User.findById(req.user["_id"]).exec();
            user.files.push(file);
            await user.save();

            res.redirect("/profile");
        } catch (error) {
            console.log("error:", error);
            res.json({
                error,
            });
        }
    }
});

router.delete("/deleteBlob/:filename", auth.ensureAuthenticated, async (req, res, next) => {
    const containerName = req.user["_id"].toString();
    const state_db = await fileController.deleteBlobDB(req.user["_id"], req.params.filename);
    const state_blob = await fileController.DeleteFile(containerName, req.params.filename);

    console.log(state_db);
    console.log(state_blob);

    if (state_db && state_blob) {
        res.json({
            success: true,
        });
    } else {
        res.json({
            success: false,
        });
    }
});

router.get("/getMetaDataOnBlob/:filename", auth.ensureAuthenticated, async (req, res) => {
    const containerName = req.user["_id"].toString();
    const metadata = await fileController.getMetaDataOnBlob(containerName, req.params.filename);
    res.json({
        success: true,
        url: metadata,
    });
});

module.exports = router;
