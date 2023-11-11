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

app.post('/images', upload.single('image'), (req, res) => {

    const { productName, imageName } = req.body;
    const imageBinaryData = req.file;

    console.log(productName + "/" + imageName);

    if (imageName && productName && imageBinaryData) {

        const imageBase64 = req.file.buffer.toString('base64');

        const options = {
            folder: productName,
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
                '&markRatio=0.25' +
                '&opacity=0.5';


            // UPLOAD IMAGE WITH WATERMARK

            cloudinary.uploader.upload(imageWithWatermark, options).then((result) => {
                console.log("success upload with watermark");

                res.json({
                    message: "success",
                    secure_url: result.secure_url,
                    url: result.url
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

    const productName = req.body.productName;
    const imageName = req.body.imageName;

    if (productName && imageName) {

        cloudinary.uploader.destroy(productName + '/' + imageName).then((result) => {
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

app.get('/images', (req, res) => {

    console.log(req.query);

    const productName = req.query.productName;
    const imageName = req.query.imageName;

    if (productName && imageName) {

        cloudinary.search
            .expression("public_id:" + productName + '/' + imageName)
            .sort_by('public_id', 'desc')
            .max_results(30)
            .execute()
            .then((result) => {
                console.log("success get");
                

                res.json({
                    message: result.total_count > 0? "success" : "not found",
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