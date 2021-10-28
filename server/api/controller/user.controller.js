const { User } = require("../models/user");
const { listBlob } = require("../controller/file.controller");

module.exports.profile = async (req, res, next) => {
    const unique_id = "" + req.user["_id"];

    const files = await listBlob(unique_id);

    console.log("user: ", req.user);
    console.log("unique_id: ", unique_id);
    console.log("files: ", files);

    res.json({ user: req.user, files });
};
