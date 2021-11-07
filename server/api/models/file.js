const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },

    downloadURl: {
        type: String,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,

    },
});

const File = mongoose.model("File", FileSchema);

module.exports = File;
