require("dotenv").config();

const connection = require("./api/config/db");
const cors = require("cors");
const express = require("express");
const app = express();

connection();

app.use(express.json());
app.use(cors());

app.use("/api", require("./api/routes/index"));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));
