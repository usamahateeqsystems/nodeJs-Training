const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    title: { type: String, default: null },
    description: { type: String, default: null },
    price: { type: Number, default: null },
    availableQuantity: { type: Number, default: null },
    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
      default: null,
    },
    otherProperties: { type: Array, default: null },
  },
  { timestamp: true }
);

module.exports = mongoose.model("product", productSchema);
