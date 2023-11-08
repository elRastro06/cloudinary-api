const axios = require('axios');
const express = require('express');
const cloudinary = require('./cloudinary');
const multer = require("multer");

const storage = multer.memoryStorage(); // Puedes cambiarlo según tus necesidades
const upload = multer({ storage: storage });


// CONFIGURE EXPRESS
const app = express();
const port = 5004   ;


// use in app x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});



// UPLOAD IMAGE

const upload_preset_signed = process.env.UPLOAD_PRESET_SIGNED;
const upload_preset_unsigned = process.env.UPLOAD_PRESET_UNSIGNED    ;

app.post('/upload', upload.single('image'), (req, res) => {

    const { productName, imageName } = req.body;
    const imageBinaryData = req.file;    

    console.log(productName  + " " + imageName);

    if(imageName && productName && imageBinaryData){
        
        const imageBase64 = req.file.buffer.toString('base64');

        const options = {
            folder: productName,
            public_id: imageName,
            upload_preset: upload_preset_signed,
            overwrite: true
        };
    
        cloudinary.uploader.upload('data:image/png;base64,' + imageBase64, options).then((result) => {
            console.log("success upload");
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