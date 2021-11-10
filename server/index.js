require("dotenv").config();

const express = require("express");
const app = express();

const connection = require("./api/config/db");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
var cookieParser = require("cookie-parser");

// const fileUpload = require("express-fileupload");

// // default options
// app.use(fileUpload());
app.use(express.static(__dirname + '/public'));

// Passport Config
require("./api/config/passport")(passport);

// view engine setup
app.set("views", "views");
app.set("view engine", "ejs");

connection();

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Express session
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use("/", require("./api/routes/index"));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));
