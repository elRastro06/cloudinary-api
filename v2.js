const express = require('express');
const cloudinary = require('./cloudinary');
const multer = require("multer");

const storage = multer.memoryStorage(); // Puedes cambiarlo según tus necesidades
const upload = multer({ storage: storage });

const watermarkURL = "https://github.com/elRastro06/cloudinary-api/blob/main/watermark.png?raw=true";

const app = express.Router();

// UPLOAD IMAGE

const upload_preset_signed = process.env.UPLOAD_PRESET_SIGNED;
const upload_preset_unsigned = process.env.UPLOAD_PRESET_UNSIGNED;

app.post('/images', upload.single('image'), async (req, res) => {

    const productId = req.body.productId;
    const imageBinaryData = req.file;

    if (productId && imageBinaryData) {

        // GET THE HIGHEST NUMBER OF IMAGE NAME OF THE FOLDER
        var imageName = 0;
        var response = {};

        response = await cloudinary.search
            .expression(`folder:${productId}/*`)
            .sort_by('public_id', 'desc')
            .max_results(30)
            .execute();

        if (response.total_count > 0) {
            imageName = (parseInt(response.resources[0].public_id.split("/")[1]) + 1).toString();
        } else {
            imageName = "1";
        }

        console.log(imageName);

        // GET THE IMAGE AND THE OPTIONS OF UPLOAD

        const imageBase64 = req.file.buffer.toString('base64');

        const options = {
            folder: productId,
            public_id: imageName,
            upload_preset: upload_preset_signed,
            overwrite: true
        };


        // UPLOAD IMAGE WITHOUT WATERMARK

        cloudinary.uploader.upload('data:image/png;base64,' + imageBase64, options).then((result) => {
            console.log("success upload without watermark");

            const imageWithWatermark = 'https://quickchart.io/watermark' +
                '?mainImageUrl=' + result.secure_url +
                '&markImageUrl=' + watermarkURL +
                '&markRatio=0.6' +
                '&opacity=0.3' +
                '&position=center';


            // UPLOAD IMAGE WITH WATERMARK

            cloudinary.uploader.upload(imageWithWatermark, options).then((result) => {
                console.log("success upload with watermark");

                res.json({
                    message: "success",
                    image:
                    {
                        public_id: result.public_id,
                        folder: result.folder,
                        secure_url: result.secure_url,
                        url: result.url
                    }

                });
            })

        }).catch((error) => {
            console.error(error);
            res.status(500).json({ err: 'Something went wrong' });
        });

    } else {
        res.status(500).json({ err: 'Missing required fields' });
    }

});


app.delete('/images', (req, res) => {
    console.log(req.body);

    const productId = req.body.productId;
    const imageName = req.body.imageName;

    if (productId && imageName) {

        cloudinary.uploader.destroy(productId + '/' + imageName).then((result) => {
            console.log("success delete");

            res.json({
                message: "success",
                result
            });
        }).catch((error) => {
            console.error(error);
            res.status(500).json({ err: 'Something went wrong' });
        });

    }

});


app.delete("/folder", (req, res) => {
    console.log(req.body);
  
    const productId = req.body.productId;
  
    if (productId) {
      // delete all images of the folder
      cloudinary.api
        .delete_resources_by_prefix(productId)
        .then((result) => {
          console.log("success delete");
  
          // delete the folder
          cloudinary.api
            .delete_folder("/" + productId)
            .then((result) => {
              console.log("success delete");
  
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

app.get('/images', (req, res) => {

    console.log(`https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/resources/image`);

    const productId = req.query.productId;
    const imageName = req.query.imageName;

    if (productId && imageName) {

        cloudinary.search
            .expression("public_id:" + productId + '/' + imageName)
            .sort_by('public_id', 'desc')
            .max_results(30)
            .execute()
            .then((result) => {
                console.log("success get");


                res.json({
                    message: result.total_count > 0 ? "success" : "not found",
                    total_count: result.total_count,
                    resources: result.resources.map(resource => {
                        return {
                            public_id: resource.public_id,
                            folder: resource.folder,
                            secure_url: resource.secure_url,
                            url: resource.url
                        }
                    })
                });
            }).catch((error) => {
                console.error(error);
                res.status(500).json({ err: 'Something went wrong' });
            });

    }

});

module.exports = app;