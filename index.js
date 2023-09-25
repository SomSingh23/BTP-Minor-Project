require("dotenv").config();
let express = require("express");
let app = express();
let mongoose = require("mongoose");
let path = require("path");
let User = require("./models/user");
let session = require("express-session");
const MongoStore = require("connect-mongo");
var findOrCreate = require("mongoose-findorcreate");
let passport = require("passport");
const { resolveSoa } = require("dns");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
let Student = require("./models/student");
const { clear } = require("console");
let moveNext = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/auth/google");
  }
};
let logoutNext = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/");
  }
};
mongoose
  .connect(process.env.CONNECT_MONGODB)
  .then(() => {
    console.log("Connected to MongoDB Mumbai Servers");
  })
  .catch((e) => console.log(e));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "views")));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 25 * 60 * 1000 },
    store: MongoStore.create({
      mongoUrl: process.env.CONNECT_MONGODB,
    }),
  })
);
// -------------------------Auth----------------------------------- //

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate(
        { googleId: profile.id, username: profile.displayName },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

// ---------------------------Auth---------------------------------- //
app.listen(process.env.PORT, () => {
  console.log("Listening on port 3000");
});
// google auth routes BTP-SEM-5 //

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);
app.get(
  "/google/api/auth",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, Now redirect .
    res.redirect("/");
  }
);

// google auth routes BTP-SEM-5 //
app.get("/", (req, res) => {
  let _ = false;
  let name = "";
  if (req.user !== undefined) {
    _ = true;
    name = req.user.username;
  }

  res.render("home", { _, name });
});

app.get("/logout", logoutNext, (req, res) => {
  res.render("logout");
});
app.post("/logout", logoutNext, (req, res) => {
  console.log("logout post route called");
  req.logout((err) => {
    if (err) {
      return res.status(400).send("error");
    } else {
      res.redirect("/");
    }
  });
});
app.get("/dashboard", moveNext, async (req, res) => {
  let data = await Student.findOne({ googleId: req.user.googleId });
  let userFirstTime = true;
  let username = req.user.username;
  if (data === null) {
    userFirstTime = false;
    return res.render("dashboard", { userFirstTime, username });
  }
  console.log(data);
  let v1 = data.verification1;
  let v2 = data.verification2;
  let v3 = data.verification3;
  res.render("verification", { v1, v2, v3 });
});
app.post("/dashboard", moveNext, async (req, res) => {
  try {
    console.log(req.body);
    let newStudent = new Student({
      username: req.user.username,
      googleId: req.user.googleId,
      isRegistered: false,
      verification1: false,
      verification2: false,
      verification3: false,
      ...req.body,
    });
    await newStudent.save();
    res.redirect("/dashboard");
  } catch (err) {
    res.status(400).redirect("/dashboard");
  }
});
// yeh remove karna hai production ke phale //
// app.get("/test", async (req, res) => {
//   try {
//     let createStudent = new Student({ googleId: req.user.googleId });
//     await createStudent.save();
//     res.send("Successfully");
//   } catch (err) {
//     res.send(err);
//   }
// });
// yeh remove karna hai production ke phale //
