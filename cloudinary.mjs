import express from "express";
import cloudinary from "./cloudinaryConfig.js";
import multer from "multer";

const storage = multer.memoryStorage(); // Puedes cambiarlo según tus necesidades
const upload = multer({ storage: storage });

const cloudinaryApp = express.Router();
const upload_preset_signed = process.env.UPLOAD_PRESET_SIGNED;

cloudinaryApp.get("/greatest", (req, res) => {
  const folderName = req.query.folderName;

  if (folderName) {
    cloudinary.search
      .expression(`folder:${folderName}/*`)
      .sort_by("public_id", "desc")
      .max_results(30)
      .execute()
      .then((result) => {
        res.json({
          message: result.total_count > 0 ? "success" : "not found",
          count: result.total_count,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ err: "Something went wrong" });
      });
  }
});

cloudinaryApp.post("/images", upload.single("image"), async (req, res) => {
  const folderName = req.body.folderName;
  const imageBinaryData = req.file;
  const imageName = req.body.imageName;

  if (folderName && imageBinaryData) {
    const imageBase64 = req.file.buffer.toString("base64");
    const options = {
      folder: folderName,
      public_id: imageName,
      upload_preset: upload_preset_signed,
      overwrite: true,
    };

    cloudinary.uploader
      .upload("data:image/png;base64," + imageBase64, options)
      .then((result) => {
        res.json({
          message: "success",
          result,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ err: "Something went wrong" });
      });
  } else {
    res.status(500).json({ err: "Missing required fields" });
  }
});

cloudinaryApp.delete("/images", (req, res) => {
  const folderName = req.body.folderName;
  const imageName = req.body.imageName;
  if (folderName && imageName) {
    cloudinary.uploader
      .destroy(folderName + "/" + imageName)
      .then((result) => {
        res.json({
          message: "success",
          result,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ err: "Something went wrong" });
      });
  }
});

cloudinaryApp.delete("/folder", (req, res) => {
  const folderName = req.body.folderName;

  if (folderName) {
    // delete all images of the folder
    cloudinary.api
      .delete_resources_by_prefix(folderName)
      .then((result) => {
        // delete the folder
        cloudinary.api
          .delete_folder("/" + folderName)
          .then((result) => {
            res.json({
              message: "success",
              result,
            });
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ err: "Something went wrong" });
          });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ err: "Something went wrong" });
      });
  }
});

cloudinaryApp.get("/images", (req, res) => {
  const folderName = req.query.folderName;
  const imageName = req.query.imageName;

  if (folderName && imageName) {
    cloudinary.search
      .expression("public_id:" + folderName + "/" + imageName)
      .sort_by("public_id", "desc")
      .max_results(30)
      .execute()
      .then((result) => {
        res.json({
          message: result.total_count > 0 ? "success" : "not found",
          total_count: result.total_count,
          resources: result.resources.map((resource) => {
            return {
              public_id: resource.public_id,
              folder: resource.folder,
              secure_url: resource.secure_url,
              url: resource.url,
            };
          }),
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ err: "Something went wrong" });
      });
  }
});

export default cloudinaryApp;
