const mongoose = require("mongoose");

const withDrawSchema = new mongoose.Schema(
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
    totalAmt: {
      type: Number,
    },
    status : {
      type: String,
      enum: ["Pending","Approved","Completed"],
      default: "Pending"
    },
  },
  { timestamps: true }
);

const Withdraw = mongoose.model("Withdraw", withDrawSchema);

module.exports = Withdraw;
