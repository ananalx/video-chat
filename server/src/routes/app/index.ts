import express from "express";
import AppController from "./controllers/AppController";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no larger than 5mb.
    fileSize: 1 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error("Only .png, .jpg and .jpeg format allowed!");
      err.name = "ExtensionError";
      return cb(err);
    }
  },
});

const router = express.Router();

router.post("/uploads", upload.array("image", 10), AppController.upload);
router.post("/videoDetails", AppController.upload);
router.post("/chatbot", AppController.chat);
router.post("/extract", AppController.extract);




export default router;
