const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    categoryName: { type: String, default: null },
    description: { type: String, default: null },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "category",
      default: null,
    },
  },
  { timestamp: true }
);

module.exports = mongoose.model("category", categorySchema);
