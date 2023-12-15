import { objects } from "./conn.mjs";
import { ObjectId } from "mongodb";
import express from "express";

const objectApp = express.Router();

objectApp.post("/", async (req, res) => {
  const object = req.body;
  try {
    const result = await objects.insertOne(object);
    res.json(result);
  } catch (e) {
    console.error(e);
  }
});

objectApp.get("/", async (req, res) => {
  try {
    const filtro = {};
    if (req.query.user) {
      filtro.user = req.query.user;
    }
    const result = await objects.find(filtro).toArray();
    res.json(result);
  } catch (e) {
    console.error(e);
  }
});

objectApp.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await objects.findOne({ _id: new ObjectId(id) });
    if (!result) {
      res.sendStatus(404);
      return;
    }
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

objectApp.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, images } = req.body;
  const object = {
    name,
    description,
    price,
    // location: {
    //   type: "Point",
    //   coordinates: location,
    // },
    images,
  };
  try {
    const result = await objects.updateOne(
      { _id: new ObjectId(id) },
      { $set: object }
    );
    res.json(result);
  } catch (e) {
    console.error(e);
  }
});

objectApp.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await objects.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (e) {
    console.error(e);
  }
});

export default objectApp;
