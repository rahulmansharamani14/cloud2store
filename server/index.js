require("dotenv").config();

const connection = require("./api/config/db");
const cors = require("cors");
const express = require("express");
const app = express();
const path = require("path");
const passport = require("passport");
const session = require("express-session");
var cookieParser = require("cookie-parser");

// Passport Config
require("./api/config/passport")(passport);

// view engine setup
app.set("views", path.join(__dirname, "views"));
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
