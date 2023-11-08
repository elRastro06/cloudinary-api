const express = require('express');
const cloudinary = require('./cloudinary');
const multer = require("multer");

const storage = multer.memoryStorage(); // Puedes cambiarlo según tus necesidades
const upload = multer({ storage: storage });

const watermarkURL = "https://github.com/elRastro06/cloudinary-api/blob/main/watermark.png?raw=true";

const app = express.Router();

// UPLOAD IMAGE

const upload_preset_signed = process.env.UPLOAD_PRESET_SIGNED;
const upload_preset_unsigned = process.env.UPLOAD_PRESET_UNSIGNED    ;

app.post('/upload', upload.single('image'), (req, res) => {

    const { productName, imageName } = req.body;
    const imageBinaryData = req.file;    

    console.log(productName  + "/" + imageName);

    if(imageName && productName && imageBinaryData){
        
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




    }else{
        res.status(500).json({ err: 'Missing required fields' });
    }

});

module.exports = app;