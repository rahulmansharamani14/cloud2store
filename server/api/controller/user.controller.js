const User = require("../models/user");
const { listBlob } = require("../controller/file.controller");

module.exports.profile = async (req, res, next) => {
    console.log("user: ", req.user);

    try {
        const data = await User.findById(req.user["_id"]).populate("files").exec();

        // const files = await File.find();
        // res.status(200).json({
        //     status: "success",
        //     files,
        // });
        const files = data.files;
        // console.log("files: ", files);

        res.render("pages/profile", { user: req.user, files });
    } catch (error) {
        res.json({
            status: "Fail",
            error,
        });
    }
};
