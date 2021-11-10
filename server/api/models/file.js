const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    downloadURL: {
        type: String,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
    },

    user_id: {
        type: String,
        required: true,
    },

    versions: [{ hashedvalue: { type: String, required: true }, version: { type: Number }, versionId: { type: String } }],
});

const File = mongoose.model("File", FileSchema);

module.exports = File;
