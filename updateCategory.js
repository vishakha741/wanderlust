const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  await Listing.updateMany(
    { $or: [
      { title: /mountain/i },
      { location: /mountain/i }
    ] },
    { $set: { category: "Mountain" } }
  );
  console.log("done");
  await mongoose.connection.close();
}
main().catch(console.log);