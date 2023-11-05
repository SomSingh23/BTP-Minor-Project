let checkAdmin = require("../functions/checkAdmin");
let moveNext = (req, res, next) => {
  let adminNo = checkAdmin(req);
  if (adminNo === 0) {
    next();
  } else {
    req.session.kahaPer = req.originalUrl;
    res.redirect("/auth/google");
  }
};
module.exports = moveNext;
