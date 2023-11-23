const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    items: { type: Array, default: null },
  },
  { timestamp: true }
);

module.exports = mongoose.model("cart", cartSchema);
