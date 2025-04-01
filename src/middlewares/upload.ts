import multer from "multer";
import path from "path";
import fs from "fs";

// Determine the absolute path for your uploads folder.
const uploadDir = path.join(__dirname, "../../uploads");

// Check if the uploads directory exists; if not, create it.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // For example, replace any space or `'` with `_`
    const safeName = file.originalname
      .replace(/'/g, "")
      .replace(/\s+/g, "_"); 
    const uniqueName = Date.now() + "-" + safeName;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
export default upload;
