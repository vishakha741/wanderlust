const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust").then(async () => {
  const r = await mongoose.connection.db.collection("listings").updateMany(
    { "geometry.type": { $exists: false } },
    { $set: { geometry: { type: "Point", coordinates: [77.0, 28.0] } } }
  );
  console.log("Updated:", r.modifiedCount);
  process.exit();
});