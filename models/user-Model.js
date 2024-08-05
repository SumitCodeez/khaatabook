const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    trim: true,
    minLength: 3,
    maxLength: 20,
    required: true,
  },
  name: {
    type: String,
    trim: true,
  },
  profilePicture: {
    data: Buffer,
    contentType: String,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  hisaab: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hisaab" }],
});

const userValidationSchema = Joi.object({
  username: Joi.string().trim().min(3).max(20).required(),
  email: Joi.string().email().required().trim(),
  password: Joi.string().required(),
});
const User = mongoose.model("User", userSchema);

module.exports = { User, userValidationSchema };
