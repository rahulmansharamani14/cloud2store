const { User } = require("../models/user");

module.exports.profile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password -__v");
        res.send(user);
    } catch (error) {
        console.log(error);
        res.send("An error occured");
    }
};
