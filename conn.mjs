import { MongoClient } from "mongodb";
import "dotenv/config";

const user = process.env.MONGO_USER;
const pwd = process.env.MONGO_PWD;
const field1 = process.env.MONGO_CONNECTION_FIELD_1;
const field2 = process.env.MONGO_CONNECTION_FIELD_2;
const connectionString = `mongodb+srv://${user}:${pwd}@${field1}.${field2}.mongodb.net/?retryWrites=true&w=majority`;
const object = new MongoClient(connectionString);
let conn;
try {
  conn = await object.connect();
} catch (e) {
  console.error(e);
}
let db = conn.db("parcial-3");
let objects = db.collection("objeto");
let users = db.collection("usuario");
objects.createIndex({ location: "2dsphere" });
export { objects, users };
