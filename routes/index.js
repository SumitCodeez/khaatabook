const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  User: userModel,
  userValidationSchema,
} = require("../models/user-Model");
const {
  isLoggedIn,
  redirectIfLogin,
} = require("../middlewares/login-middleware");
const { options } = require(".");
const multer = require("multer");
const upload = require("../config/multer-config");

const router = express.Router();

router.get("/", redirectIfLogin, function (req, res) {
  res.render("index", {
    error: req.flash("error"),
    errors: req.flash("errors"),
    success: req.flash("success"),
  });
});

router.get("/profile", isLoggedIn, async function (req, res) {
  try {
    let byDate = Number(req.query.byDate);
    let { startDate, endDate } = req.query;

    byDate = byDate ? byDate : -1;
    startDate = startDate ? startDate : new Date("1970-01-01");
    endDate = endDate ? endDate : new Date();

    let user = await userModel.findOne({ email: req.user.email }).populate({
      path: "hisaab",
      match: { createdAt: { $gte: startDate, $lte: endDate } },
      options: { sort: { createdAt: byDate } },
    });

    if (!user) {
      req.flash("errors", "User not found");
      return res.redirect("/");
    }

    res.render("profile", {
      user,
      loggedin: true,
      showCreateLink: true,
      success: req.flash("success"),
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/");
  }
});

router.post(
  "/upload-profile-picture",
  isLoggedIn,
  upload.single("profilePicture"),
  async function (req, res) {
    try {
      const file = req.file;
      if (!file) {
        req.flash("error", "No file uploaded.");
        return res.redirect("/profile");
      }

      let user = await userModel.findOne({ email: req.user.email });
      if (!user) {
        req.flash("errors", "User not found");
        return res.redirect("/");
      }

      user.profilePicture = {
        data: file.buffer,
        contentType: file.mimetype,
      };

      await user.save();

      req.flash("success", "Profile picture uploaded successfully.");
      res.redirect("/profile");
    } catch (err) {
      console.error(err);
      req.flash(
        "error",
        "An error occurred while uploading the profile picture."
      );
      res.redirect("/profile");
    }
  }
);

router.get("/register", function (req, res) {
  res.render("register", {
    error: req.flash("error"),
    success: req.flash("success"),
  });
});

router.post("/register", async function (req, res) {
  try {
    const { error } = userValidationSchema.validate(req.body);
    if (error) {
      req.flash("error", error.details[0].message);
      return res.redirect("/register");
    }

    let { username, email, password } = req.body;

    let user = await userModel.findOne({ email });
    if (user) {
      req.flash("error", "Sorry you already have an account, please login.");
      return res.redirect("/register");
    }

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) {
          req.flash("error", "An error occurred while hashing the password.");
          return res.redirect("/register");
        }
        let createdUser = await userModel.create({
          email,
          username,
          password: hash,
        });

        let token = jwt.sign(
          { email, id: createdUser._id },
          process.env.JWT_SECRET
        );

        res.cookie("token", token);
        req.flash("success", "User created successfully");
        res.redirect("/profile");
      });
    });
  } catch (err) {
    res.send(err.message);
  }
});

router.post("/login", async function (req, res) {
  try {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      req.flash("error", "Email or password incorrect");
      return res.redirect("/");
    }

    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
        let token = jwt.sign({ email, id: user._id }, process.env.JWT_SECRET);

        res.cookie("token", token);
        req.flash("success", "Logged in successfully");
        res.redirect("/profile");
      } else {
        req.flash("error", "Email or password incorrect");
        res.redirect("/");
      }
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/");
  }
});

router.get("/logout", function (req, res) {
  res.cookie("token", "");
  req.flash("success", "Logged out successfully");
  res.redirect("/");
});

module.exports = router;
