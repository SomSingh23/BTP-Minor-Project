let checkAdmin = require("../functions/checkAdmin");
let moveAdmin3 = (req, res, next) => {
  let adminNo = checkAdmin(req);
  if (adminNo === 3) {
    next();
  } else {
    req.session.kahaPer = req.originalUrl;
    res.redirect("/login");
  }
};
module.exports = moveAdmin3;
