import express from "express";
import cors from "cors";
import cloudinaryApp from "./cloudinary.mjs";

// CONFIGURE EXPRESS
const app = express();
const port = 5004;

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});

app.use("/", cloudinaryApp);
