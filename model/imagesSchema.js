const mongoose = require("mongoose");

const imgSchema = new mongoose.Schema(
  {
    name: String,
    contestId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true
    },
    img: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imgSchema);
