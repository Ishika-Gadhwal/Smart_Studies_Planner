

import multer from 'multer';
import path from 'path';

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// PDF filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);  // Reject the file if it's not a PDF
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

export default upload;
