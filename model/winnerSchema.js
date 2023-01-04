const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema(
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
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Winner", winnerSchema);
