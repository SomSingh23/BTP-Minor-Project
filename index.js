require("dotenv").config();
let express = require("express");
let app = express();
let mongoose = require("mongoose");
let path = require("path");
let User = require("./models/user");
let Email = require("./models/email");
let session = require("express-session");
let passport = require("passport");
let strategy = require("passport-local");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
let Student = require("./models/student");
let sendEmail = require("./utils/email/semail");
let formSubmitMessage = require("./utils/functions/formSubmissionMessage");
let redis_client = require("./utils/redis/clientConfigure");
let RedisStore = require("connect-redis").default;
let moveNext = require("./utils/middleware/moveNext");
let logoutNext = require("./utils/middleware/logoutNext");
let checkAdmin = require("./utils/functions/checkAdmin");
let moveAdmin1 = require("./utils/middleware/moveAdmin1");
let moveAdmin2 = require("./utils/middleware/moveAdmin2");
let moveAdmin3 = require("./utils/middleware/moveAdmin3");
let moveAdmin = require("./utils/middleware/moveAdmin");
let Profile = require("./models/profile");
let flash = require("connect-flash");
// const MongoStore = require("connect-mongo"); no longer needed to store session :) might use in future
mongoose
  .connect(process.env.CONNECT_MONGODB)
  .then(() => {
    console.log("Connected to MongoDB Mumbai Servers");
  })
  .catch((e) => console.log(e));

app.set("view engine", "ejs");
app.use(flash());
app.use(express.static(path.join(__dirname, "views")));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30, httpOnly: true },
    store: new RedisStore({ client: redis_client }),
    /* store: MongoStore.create({
      mongoUrl: process.env.CONNECT_MONGODB,
      // not storing session on mongoDB use to slow speed :(, but could use later on.... if free redis DB goes out of storage
    }) */
  })
);
// message flash middleware

app.use((req, res, next) => {
  res.locals.message = req.flash("message");
  next();
});
// message flash middleware ends
// -------------------------Auth----------------------------------- //

app.use(passport.initialize());
app.use(passport.session());
passport.use(new strategy(User.authenticate()));
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
    async function (accessToken, refreshToken, profile, cb) {
      // console.log(profile);
      let data = await Email.findOne({ googleId: profile.id });
      if (data === null) {
        let newData = new Email({
          googleId: profile.id,
          email: profile.emails[0].value,
        });
        await newData.save();
      }
      data = await Profile.findOne({ googleId: profile.id });
      if (data === null) {
        let newData = new Profile({
          googleId: profile.id,
          email: profile.emails[0].value,
          picture: profile.photos[0].value,
          email_verified: profile._json.email_verified,
          name: profile.displayName,
        });
        await newData.save();
      }
      User.findOrCreate(
        {
          googleId: profile.id,
          username: profile.displayName,
        },
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
  (req, res, next) => {
    if (req.user === undefined) {
      next();
    } else {
      res.redirect("/");
    }
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
app.get(
  "/google/api/auth",
  (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
    next();
  },
  (req, res, next) => {
    let redirectTo = req.session.kahaPer || "/";
    res.locals.redirectTo = redirectTo;
    next();
  },
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, Now redirect .
    req.flash("message", "Student login successful. Welcome aboard!"); // flashing message :)
    res.redirect(res.locals.redirectTo);
  }
);

// google auth routes BTP-SEM-5 //

app.get("/", async (req, res) => {
  try {
    let category = checkAdmin(req);
    let _ = false;
    let name = "";
    if (req.user !== undefined) {
      _ = true;
      name = req.user.username;
    }
    // counting current number of sessions :____)
    let keys = await redis_client.keys("sess:*");
    let count = keys.length;
    res.render("home", { category, _, name, count });
  } catch (err) {
    console.log(err);
    res.status(400).render("error_404");
  }
});

app.get("/dashboard", moveNext, async (req, res) => {
  return res.render("student_dashboard", {
    category: 0,
    name: req.user.username,
  });
});
app.get("/student/register", moveNext, async (req, res) => {
  let data = await Student.findOne({ googleId: req.user.googleId });
  let userFirstTime = true;
  let data2 = await Email.findOne({ googleId: req.user.googleId });
  let userEmail = data2.email;
  let username = req.user.username;
  if (data === null) {
    userFirstTime = false;
    return res.render("dashboard", {
      userFirstTime,
      username,
      userEmail,
      category: 0,
    });
  }

  res.status(200).render("student_form_already_filled", { category: 0 });
});

app.get("/student/status", moveNext, async (req, res) => {
  let data = await Student.findOne({ googleId: req.user.googleId });
  if (data === null) {
    return res.render("student_form_not_filled", { category: 0 });
  }
  let v1 = data.verification1;
  let v2 = data.verification2;
  let v3 = data.verification3;
  let v1_status = data.verification1Status;
  let v2_status = data.verification2Status;
  let v3_status = data.verification3Status;
  if (v1_status !== process.env.STATUS) {
    return res.render("v1_student_fail", { v1_status, category: 0 });
  }
  if (v2_status !== process.env.STATUS) {
    return res.render("v2_student_fail", { v2_status, category: 0 });
  }
  if (v3_status !== process.env.STATUS) {
    return res.render("v3_student_fail", { v3_status, category: 0 });
  }
  res.render("verification", { v1, v2, v3, category: 0 });
});
app.get("/student/profile", moveNext, async (req, res) => {
  try {
    let data = await Profile.findOne({ googleId: req.user.googleId });
    return res.render("student_profile", { data, category: 0 });
  } catch (err) {
    res.status(400).render("error_404");
  }
});
app.get("/student/how_to_register", moveNext, async (req, res) => {
  res.render("student_how_to_register", { category: 0 });
});
app.post("/dashboard", moveNext, async (req, res) => {
  try {
    let __d = await Student.findOne({ googleId: req.user.googleId });
    if (__d !== null) {
      console.log("multiple clicks");
      return res.redirect("/dashboard");
    }
    let newStudent = new Student({
      username: req.user.username,
      googleId: req.user.googleId,
      isRegistered: false,
      verification1: false,
      verification2: false,
      verification3: false,
      verification1Status: process.env.STATUS,
      verification2Status: process.env.STATUS,
      verification3Status: process.env.STATUS,
      ...req.body,
    });
    await newStudent.save();
    req.flash("message", "Registration form submitted successfully."); // flashing message :)
    res.redirect("/dashboard");
    try {
      let message = await formSubmitMessage(req.user.username); // always resolved
      await sendEmail(
        req.body.email,
        "Thank you for filling out the registration form",
        message
      );
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    res.status(400).redirect("/dashboard");
  }
});

app.post("/dashboard/fail", moveNext, async (req, res) => {
  if (req.body.ans === "no") {
    // this need to change
    return res.redirect("/");
  }
  // delete the user data from student model
  console.log(req.body);
  await Student.findOneAndDelete({ googleId: req.user.googleId });
  return res.redirect("/student/register");
});
// highly___protected/admin routes starts from here  //
app.get(
  "/login",
  (req, res, next) => {
    if (req.isAuthenticated() === true) {
      let category = checkAdmin(req);
      if (category === 0) {
        return res.redirect("/dashboard");
      } else {
        let returnUrl = `/v${category}_dashboard`;
        return res.redirect(returnUrl);
      }
    }
    next();
  },
  (req, res) => {
    // this needs alot of improvement
    let category = checkAdmin(req);
    res.render("login", { category });
  }
);
// admin routes
app.get("/v1_dashboard", moveAdmin, moveAdmin1, async (req, res) => {
  res.render("v1_dashboard", { category: 1 });
});
app.get("/v1_dashboard/verified", moveAdmin, moveAdmin1, async (req, res) => {
  let data = await Student.find({});
  let registered = data.length;
  data = await Student.find({
    verification1: true,
    verification1Status: process.env.STATUS,
  });
  let verified = data.length;
  data = await Student.find({
    verification1: false,
    verification1Status: { $ne: process.env.STATUS },
  });
  let rejected = data.length;
  let pending = registered - verified - rejected;

  res.render("v1_dashboard_verified", { pending, verified, category: 1 });
});
app.get("/v1_dashboard/rejected", moveAdmin, moveAdmin1, async (req, res) => {
  let data = await Student.find({
    verification1: true,
    verification1Status: process.env.STATUS,
  });
  let verified = data.length;
  data = await Student.find({
    verification1: false,
    verification1Status: { $ne: process.env.STATUS },
  });
  let rejected = data.length;

  res.render("v1_dashboard_rejected", { verified, rejected, category: 1 });
});
app.get("/v1_dashboard/stastics", moveAdmin, moveAdmin1, async (req, res) => {
  let data = await Student.find({});
  let registered = data.length;
  data = await Student.find({
    verification1: true,
    verification1Status: process.env.STATUS,
  });
  let verified = data.length;
  data = await Student.find({
    verification1: false,
    verification1Status: { $ne: process.env.STATUS },
  });
  let rejected = data.length;
  let pending = registered - verified - rejected;
  const colors = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12"];
  const labels = ["Registered", "Verified", "Rejceted", "Pending"];
  const values = [registered, verified, rejected, pending];

  res.render("v1_dashboard_stat", { labels, values, colors, category: 1 });
});
app.get("/v1", moveAdmin, moveAdmin1, async (req, res) => {
  let data = await Student.find({});
  res.render("v1", { data, category: 1 });
});
app.get("/v2", moveAdmin, moveAdmin2, async (req, res) => {
  let data = await Student.find({});
  res.render("v2", { data, category: 2 });
});
app.get("/v3", moveAdmin, moveAdmin3, async (req, res) => {
  let data = await Student.find({});
  res.render("v3", { data, category: 3 });
});
app.get("/v1/:id", moveAdmin, moveAdmin1, async (req, res) => {
  let data = await Student.findOne({ googleId: req.params.id });
  if (data === null) {
    return res.redirect("/v1");
  } else if (
    data.verification1 === true ||
    data.verification1Status !== process.env.STATUS
  ) {
    // this user is already verified :) or rejected :(
    return res.redirect("/v1");
  }
  res.render("v1_student", {
    username: data.username,
    googleId: data.googleId,
    misNo: data.misNo,
    semester: data.semester,
    currentYear: data.currentYear,
    messFee: data.messFee,
    category: 1,
  });
});

app.post("/v1/:id", moveAdmin, moveAdmin1, async (req, res) => {
  let _check = await Student.findOne({ googleId: req.params.id });
  if (_check === null) {
    console.log("someone doing bad stuff");
    return res.redirect("/v1");
  }
  if (req.body.verification === "yes") {
    console.log("success v1");
    await Student.updateOne(
      {
        googleId: req.params.id,
      },
      {
        $set: {
          verification1: true,
        },
      }
    );
  } else {
    return res.redirect(`/v1/${req.params.id}/fail`);
  }
  return res.redirect("/v1");
});
app.get("/v1/:id/fail", moveAdmin, moveAdmin1, async (req, res) => {
  let data = await Student.findOne({ googleId: req.params.id });
  if (
    data === null ||
    data.verification1 === true ||
    data.verification1Status !== process.env.STATUS
  ) {
    return res.redirect("/v1");
  }
  let username = data.username;
  console.log(username);
  res.render("v1_fail", { username, googleId: req.params.id, category: 1 });
});
app.post("/v1/:id/fail", moveAdmin, moveAdmin1, async (req, res) => {
  let data = await Student.findOne({ googleId: req.params.id });
  if (data.verification1Status !== process.env.STATUS)
    return res.redirect("/v1");
  await Student.updateOne(
    {
      googleId: req.params.id,
    },
    {
      $set: {
        verification1Status: req.body.reason,
      },
    }
  );
  res.redirect("/v1");
});
// v2
app.get("/v2_dashboard", moveAdmin, moveAdmin2, async (req, res) => {
  res.render("v2_dashboard", { category: 2 });
});
app.get("/v2/:id", moveAdmin, moveAdmin2, async (req, res) => {
  let data = await Student.findOne({ googleId: req.params.id });
  if (
    data === null ||
    data.verification2 === true ||
    data.verification2Status !== process.env.STATUS
  ) {
    return res.redirect("/v2");
  }
  res.render("v2_student", {
    username: data.username,
    googleId: data.googleId,
    misNo: data.misNo,
    semester: data.semester,
    currentYear: data.currentYear,
    messFee: data.messFee,
    category: 2,
  });
});

app.post("/v2/:id", moveAdmin, moveAdmin2, async (req, res) => {
  let _check = await Student.findOne({ googleId: req.params.id });
  if (_check === null) {
    console.log("someone doing bad stuff");
    return res.redirect("/v2");
  }
  if (req.body.verification === "yes") {
    console.log("success v2");
    await Student.updateOne(
      {
        googleId: req.params.id,
      },
      {
        $set: {
          verification2: true,
        },
      }
    );
  } else {
    return res.redirect(`/v2/${req.params.id}/fail`);
  }
  return res.redirect("/v2");
});
app.get("/v2/:id/fail", moveAdmin, moveAdmin2, async (req, res) => {
  let data = await Student.findOne({ googleId: req.params.id });
  if (
    data === null ||
    data.verification2 === true ||
    data.verification2Status !== process.env.STATUS
  ) {
    return res.redirect("/v2");
  }
  let username = data.username;
  console.log(username);
  res.render("v2_fail", { username, googleId: req.params.id, category: 2 });
});
app.post("/v2/:id/fail", moveAdmin, moveAdmin2, async (req, res) => {
  let data = await Student.findOne({ googleId: req.params.id });
  if (data.verification2Status !== process.env.STATUS)
    return res.redirect("/v2");
  await Student.updateOne(
    {
      googleId: req.params.id,
    },
    {
      $set: {
        verification2Status: req.body.reason,
      },
    }
  );
  res.redirect("/v2");
});
// v2 ends

// v3 routes starts
app.get("/v3_dashboard", moveAdmin, moveAdmin3, async (req, res) => {
  res.render("v3_dashboard", { category: 3 });
});
app.get("/v3/:id", moveAdmin, moveAdmin3, async (req, res) => {
  let data = await Student.findOne({ googleId: req.params.id });
  if (
    data === null ||
    data.verification3 === true ||
    data.verification3Status !== process.env.STATUS
  ) {
    return res.redirect("/v3");
  }
  res.render("v3_student", {
    username: data.username,
    googleId: data.googleId,
    misNo: data.misNo,
    semester: data.semester,
    currentYear: data.currentYear,
    messFee: data.messFee,
    category: 3,
  });
});

app.post("/v3/:id", moveAdmin, moveAdmin3, async (req, res) => {
  let _check = await Student.findOne({ googleId: req.params.id });
  if (_check === null) {
    console.log("someone doing bad stuff");
    return res.redirect("/v3");
  }
  if (req.body.verification === "yes") {
    // send mail to student that he/she is verified :)
    console.log("success v3");
    await Student.updateOne(
      {
        googleId: req.params.id,
      },
      {
        $set: {
          verification3: true,
        },
      }
    );
  } else {
    return res.redirect(`/v3/${req.params.id}/fail`);
  }
  return res.redirect("/v3");
});
app.get("/v3/:id/fail", moveAdmin, moveAdmin3, async (req, res) => {
  let data = await Student.findOne({ googleId: req.params.id });
  if (
    data === null ||
    data.verification3 === true ||
    data.verification3Status !== process.env.STATUS
  ) {
    return res.redirect("/v3");
  }
  let username = data.username;
  console.log(username);
  res.render("v3_fail", { username, googleId: req.params.id, category: 3 });
});
app.post("/v3/:id/fail", moveAdmin, moveAdmin3, async (req, res) => {
  let data = await Student.findOne({ googleId: req.params.id });
  if (data.verification3Status !== process.env.STATUS)
    return res.redirect("/v3");
  await Student.updateOne(
    {
      googleId: req.params.id,
    },
    {
      $set: {
        verification3Status: req.body.reason,
      },
    }
  );
  res.redirect("/v3");
});
// v3 routes end here
// login route
app.get("/logout", logoutNext, (req, res) => {
  let category = checkAdmin(req);
  let noAnswer;
  if (category === 0) noAnswer = "/dashboard";
  else {
    noAnswer = `/v${category}_dashboard`;
  }
  res.render("logout", { category, noAnswer });
});
app.post("/logout", logoutNext, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(400).send("error");
    } else {
      res.redirect("/");
    }
  });
});
app.post(
  "/login",
  (req, res, next) => {
    // will change this later on
    if (req.isAuthenticated()) {
      return res.send(
        "already logged in kindly logout first and then login to v1/v2/v3"
      );
    }
    next();
  },
  (req, res, next) => {
    res.locals.userWant = req.session.kahaPer || "/";
    next();
  },
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    console.log("login successful");
    return res.redirect(res.locals.userWant);
  }
);
// invalid route ke liye //
app.get("*", (req, res) => {
  res.status(404).render("error_404");
});
