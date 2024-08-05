const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const indexRouter = require("./routes/index");
const hisaabRouter = require("./routes/hisaab");
const db = require("./config/mongoose-connection");
const multer = require("multer");
require("dotenv").config();

const cookieParser = require("cookie-parser");
const path = require("path");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/hisaab", hisaabRouter);

app.listen(process.env.PORT || 3100);
