const axios = require('axios');
const express = require('express');
const cloudinary = require('./cloudinary');

// CONFIGURE EXPRESS
const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});


// UPLOAD IMAGE
const image = 'image_test/gato.jpg';
const upload_preset = process.env.UPLOAD_PRESET;

app.post('/upload', async (req, res) => {
    const productName = req.body.productName;
    const imageName = req.body.imageName;

    if(req.body.imageName && req.body.productName){

        const options = {
            folder: productName,
            public_id: imageName,
        };
    
        cloudinary.uploader.unsigned_upload(image, upload_preset, options).then((result) => {
            console.log(result);
            res.json({
                message: "success",
                secure_url: result.secure_url,
                url: result.url
            });
        }).catch((error) => {
            console.error(error);
            res.status(500).json({ err: 'Something went wrong' });
        });

    }else{
        res.status(500).json({ err: 'Missing required fields' });
    }

});


