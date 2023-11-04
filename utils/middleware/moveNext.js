let moveNext = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.session.kahaPer = req.originalUrl;
    res.redirect("/auth/google");
  }
};
module.exports = moveNext;
