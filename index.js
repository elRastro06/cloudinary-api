const express = require('express');
const v1 = require('./v1.js');

// CONFIGURE EXPRESS
const app = express();
const port = 5004;

// use in app x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

app.use("/v1", v1);
