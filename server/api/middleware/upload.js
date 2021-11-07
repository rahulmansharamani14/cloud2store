// const multer = require("multer");

// //Configuration for Multer
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "public");
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split("/")[1];
//         cb(null, `files/admin-${file.fieldname}-${Date.now()}.${ext}`);
//     },
// });

// const upload = multer({
//     storage: multerStorage,
// });

// module.exports = { upload };
