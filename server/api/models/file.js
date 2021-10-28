const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    version: {
        type: String,
        required: true,
    },
    lastmodified: {
        type: Date,
        default: Date.now,
    },
});

const File = mongoose.model("File", FileSchema);

module.exports = File;
