const mongoose = require("mongoose");

const hisaabSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 100,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    encrypted: {
      type: Boolean,
      default: false,
    },
    shareable: {
      type: Boolean,
      default: false,
    },
    passcode: {
      type: String,
      default: "",
    },
    editpermissions: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

["encrypted", "shareable", "editpermissions"].forEach((field) => {
  mongoose.Schema.Types.Boolean.convertToTrue.add(field.toLowerCase());
});

const Hisaab = mongoose.model("Hisaab", hisaabSchema);

module.exports = Hisaab;
