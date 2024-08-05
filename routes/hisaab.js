const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const hisaabModel = require("../models/hisaab-Model");
const userModel = require("../models/user-Model");
const {
  isLoggedIn,
  checkHisaabAccess,
} = require("../middlewares/login-middleware");
const session = require("express-session");

const router = express.Router();

router.get("/create", isLoggedIn, async function (req, res) {
  res.render("hisaab", {
    success: req.flash("success"),
    loggedin: true,
    showCreateLink: false,
  });
});

router.post("/create", isLoggedIn, async function (req, res) {
  let { title, description, encrypted, shareable, passcode, editpermissions } =
    req.body;

  encrypted = encrypted === "on";
  shareable = shareable === "on";
  editpermissions = editpermissions === "on";

  let hisaab = await hisaabModel.create({
    title,
    description,
    user: req.user.id,
    encrypted,
    shareable,
    passcode,
    editpermissions,
  });

  let user = await userModel.findOne({ email: req.user.email });

  user.hisaab.push(hisaab._id);
  await user.save();
  req.flash("success", "Hisaab created Successfully");
  res.redirect("/profile");
});

router.get("/view/:id", async function (req, res) {
  let hisaab = await hisaabModel.findOne({ _id: req.params.id });
  if (hisaab.encrypted) {
    res.render("passcode", {
      hisaabid: req.params.id,
      error: req.flash("error"),
    });
  } else {
    res.render("viewHisaab", { hisaab, loggedin: true, showCreateLink: false });
  }
});

router.post("/:id/verify", async function (req, res) {
  let hisaab = await hisaabModel.findOne({ _id: req.params.id });
  if (hisaab.passcode === req.body.passcode) {
    req.session.hisaabaccess = req.params.id;
    res.redirect(`/hisaab/${req.params.id}`);
  } else {
    req.flash("error", "wrong passcode");
    res.redirect(`/hisaab/view/${req.params.id}`);
  }
});

router.get("/edit/:id", isLoggedIn, async function (req, res) {
  const id = req.params.id;

  const hisaab = await hisaabModel.findById(id);

  if (!hisaab) {
    req.flash(
      "error",
      "Hisaab not found or you don't have permission to delete it"
    );
    return res.redirect("/profile");
  }

  return res.render("edit", { isloggedin: true, hisaab });
});
router.post("/edit/:id", isLoggedIn, async function (req, res) {
  const id = req.params.id;

  const hisaab = await hisaabModel.findById(id);

  if (!hisaab) {
    req.flash(
      "error",
      "Hisaab not found or you don't have permission to delete it"
    );
    return res.redirect("/profile");
  }

  hisaab.title = req.body.title;
  hisaab.description = req.body.description;
  hisaab.editpermissions = req.body.editpermissions == "on" ? true : false;
  hisaab.encrypted = req.body.encrypted == "on" ? true : false;
  hisaab.passcode = req.body.passcode;
  hisaab.shareable = req.body.shareable == "on" ? true : false;

  await hisaab.save();

  req.flash("success", "Hisaab edited successfully");
  res.redirect("/profile");
});

router.get("/delete/:id", isLoggedIn, async function (req, res) {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    req.flash("error", "Invalid Hisaab ID");
    return res.redirect("/profile");
  }

  const hisaab = await hisaabModel.findOne({
    _id: id,
    user: req.user.id,
  });

  if (!hisaab) {
    req.flash(
      "error",
      "Hisaab not found or you don't have permission to delete it"
    );
    return res.redirect("/profile");
  }

  await hisaabModel.deleteOne({
    _id: id,
  });

  req.flash("success", "Hisaab deleted successfully");
  return res.redirect("/profile");
});

router.get("/:id", isLoggedIn, checkHisaabAccess, async function (req, res) {
  let hisaab = await hisaabModel.findOne({ _id: req.params.id });
  res.render("viewHisaab", { hisaab, loggedin: true, showCreateLink: false });
});

module.exports = router;
