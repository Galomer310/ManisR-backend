// backend/src/middlewares/upload.ts

import multer from "multer";
import path from "path";

// Configure Multer storage options to store uploaded files in the "uploads" folder.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the "uploads" directory exists at the backend root.
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using the current timestamp and original filename.
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Export the configured multer middleware.
export default upload;
