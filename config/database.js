const mongoose = require("mongoose");

exports.connect = () => {
  mongoose
    .connect("mongodb://localhost:27017")
    .then(() => {
      console.log("Connected");
    })
    .catch((error) => {
      console.log("There was an error connected to the database");
      console.error(error);
      process.exit(1);
    });
};
