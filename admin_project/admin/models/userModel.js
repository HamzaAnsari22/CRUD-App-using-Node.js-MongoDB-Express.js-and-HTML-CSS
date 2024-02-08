const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id :{
      type: String,
    },
    name : {
      type: String,
      required: [true, "Please specify name!"],
    },
    email : {
      type: String,
      required: [true, "Please specify email!"],
    },
    password : {
      type: String,
      required: [true, "Please specify password!"],
    },
    referralCode : {
      type: String,
      required: [true],
    },
    referredBy : {
      type: String,
    },
    role : {
      type: String,
      default: "user",
    },
    walletAddress : {
      type: String,
      default: "",
    },
    code : {
      type: String,
    },
    lastWithdraw : {
      type: Date,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
