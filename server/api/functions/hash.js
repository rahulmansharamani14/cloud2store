const crypto = require("crypto");

module.exports.hash_file = (file_buffer) => {
    const hashSum = crypto.createHash("sha256");
    hashSum.update(file_buffer);

    const hash = hashSum.digest("hex");
    return hash;
};
