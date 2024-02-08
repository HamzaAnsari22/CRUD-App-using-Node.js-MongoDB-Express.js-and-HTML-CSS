const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
  {
    id :{
      type: String,
    },
    email : {
      type: String,
      required: [true, "Please specify email!"],
    },
    amount : {
      type: Number,
      required: [true, "Please specify amount!"],
    },
    profit : {
      type: Number,
    },
    screenshotPath : {
      type: String,
    },
    screenshot : {
      type: Buffer,
    },
    status : {
      type: String,
      enum: ["Pending","Approved","Completed","Cancelled"],
      default: "Pending"
    },
  },
  { timestamps: true }
);

const Deposit = mongoose.model("Deposit", depositSchema);

module.exports = Deposit;
