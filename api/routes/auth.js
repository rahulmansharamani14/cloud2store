const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

const { createContainer } = require("../controller/file.controller");

// Load User model
const User = require("../models/user");
const { forwardAuthenticated } = require("../middleware/auth");

// Login Page
router.get("/login", (req, res) => res.render("pages/login"));

// Register Page
router.get("/register", (req, res) => res.render("pages/register"));

// Register
router.post("/register", (req, res) => {
    console.log(req.body);

    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: "Please enter all fields" });
    }

    if (password != password2) {
        errors.push({ msg: "Passwords do not match" });
    }

    if (password.length < 6) {
        errors.push({ msg: "Password must be at least 6 characters" });
    }

    console.log("errors: ", errors);

    if (errors.length > 0) {
        res.render("pages/register", {
            errors,
            name,
            email,
            password,
            password2,
        });
    } else {
        User.findOne({ email: email }).then((user) => {
            if (user) {
                errors.push({ msg: "Email already exists" });
                res.render("pages/register", {
                    errors,
                    name,
                    email,
                    password,
                    password2,
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password,
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then((user) => {
                                //req.flash("success_msg", "You are now registered and can log in");
                                const unique_id = "" + user["_id"];

                                createContainer(unique_id);
                                res.redirect("/auth/login");
                            })
                            .catch((err) => console.log(err));
                    });
                });
            }
        });
    }
});

// Login
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/profile",
        failureRedirect: "/auth/login",
        failureFlash: true,
    })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
    req.logout();
    //req.flash("success_msg", "You are logged out");
    res.redirect("/auth/login");
});

module.exports = router;
