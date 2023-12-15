import { users } from "./conn.mjs";
import { ObjectId } from "mongodb";
import express from "express";

const userApp = express.Router();

userApp.post("/", async (req, res) => {
  const { sub, name, email } = req.body;
  const userExists = await users.findOne({ sub });
  if (userExists) {
    res.sendStatus(200);
    return;
  }
  const user = {
    sub,
    name,
    email,
  };
  try {
    const result = await users.insertOne(user);
    res.json(result);
  } catch (e) {
    console.error(e);
  }
});

userApp.get("/", async (req, res) => {
  try {
    const result = await users.find().toArray();
    res.json(result);
  } catch (e) {
    console.error(e);
  }
});

userApp.get("/:sub", async (req, res) => {
  const { sub } = req.params;
  try {
    const result = await users.findOne({ sub });
    if (!result) {
      res.sendStatus(404);
      return;
    }
    res.json(result);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

export default userApp;
