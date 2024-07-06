//@ts-nocheck
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Schema for user
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require  : true,
  },
  email: {
    type: String,
    require: true,
  },
  phone: {
    type: String  ,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// Pre-save middleware to hash the password
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
      next();
  }
  try {
    const saltRound = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(user.password, saltRound);
    user.password = hash_password;
    
  } catch (error) {
    next(error); 
  }
});
// Method to compare password
userSchema.methods.comparePassword = async function (password) {

  return  bcrypt.compare(password, this.password);
  };

// Method to generate JWT
userSchema.methods.generateToken = async function () {
     try {
   return jwt.sign(
      {
        userId: this._id.toString(),
       email: this.email,
        isAdmin: this.isAdmin,
     },
     process.env.JWT_SECRET_KEY,
      {
        expiresIn: "180d",
      }
    );
  } catch (error) {
    console.error(error);
    throw new Error("Token generation failed");
  }
};

// Model for user
const User = mongoose.model("User", userSchema);

module.exports = User;
