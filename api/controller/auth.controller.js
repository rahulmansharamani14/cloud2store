const { User } = require("../models/user");
const bcrypt = require("bcrypt");

const { validate_register, validate_login } = require("../helpers/validate");
const { createContainer } = require("../controller/file.controller");

module.exports.register = async (req, res, next) => {
    try {
        const { error } = validate_register(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = new User(req.body);

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();

        const unique_id = "" + user["_id"];

        createContainer(unique_id);

        res.send(user);
    } catch (error) {
        console.log(error);
        res.send("An error occured");
    }
};

module.exports.login = async (req, res, next) => {
    try {
        const { error } = validate_login(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send("Invalid email or password");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).send("Invalid email or password");

        const token = user.generateAuthToken();
        res.send(token);
    } catch (error) {
        console.log(error);
        res.send("An error occured");
    }
};
