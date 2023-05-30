const { MongoClient } = require("mongodb");

const db = {};

const connectToDb = async () => {
  const client = new MongoClient("mongodb://127.0.0.1:27017");
  try {
    await client.connect();
    console.log("Connected to MongoDB server");
    const database = client.db("store");
    db.inventories = database.collection("inventories");
    db.orders = database.collection("orders");
    db.users = database.collection("users");

    const a1 = await db.orders.find({}).toArray();
    console.log(a1);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    client.close(); // Close the connection when finished
  }
};

connectToDb();

module.exports = { connectToDb, db };