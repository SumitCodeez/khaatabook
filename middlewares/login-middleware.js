const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
  if (req.cookies.token) {
    if (process.env.JWT_SECRET) {
      jwt.verify(
        req.cookies.token,
        process.env.JWT_SECRET,
        function (err, data) {
          if (err) {
            console.log(err);
          }

          req.user = data;
          next();
        }
      );
    } else {
      res.redirect("set your env variables");
    }
  } else {
    res.redirect("/");
  }
}

function redirectIfLogin(req, res, next) {
  if (req.cookies.token) {
    res.redirect("/profile");
  } else next();
}

function checkHisaabAccess(req, res, next) {
  if (req.session.hisaabaccess === req.params.id) {
    next();
  } else {
    res.redirect(`/hisaab/view/${req.params.id}`);
  }
}

module.exports = { isLoggedIn, redirectIfLogin, checkHisaabAccess };
