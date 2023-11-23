const mongoose = require("mongoose");
require("dotenv").config();


exports.connect = () => {
  mongoose
    .connect(process.env.DATABASE_CONNECTION_STRING)
    .then(() => {
      console.log("Connected");
    })
    .catch((error) => {
      console.log("There was an error connected to the database");
      console.error(error);
      process.exit(1);
    });
};
