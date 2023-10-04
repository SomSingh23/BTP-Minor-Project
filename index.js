require("dotenv").config();
let express = require("express");
let app = express();
let mongoose = require("mongoose");
let path = require("path");
let User = require("./models/user");
let Email = require("./models/email");
let session = require("express-session");
const MongoStore = require("connect-mongo");
var findOrCreate = require("mongoose-findorcreate");
let passport = require("passport");
const { resolveSoa } = require("dns");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
let Student = require("./models/student");
let sendEmail = require("./utils/email/semail");
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
    cookie: { maxAge: 3600000 },
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
    async function (accessToken, refreshToken, profile, cb) {
      // yeh wala section new hai, taking email from user and saving it to Email model
      // console.log(profile.emails[0].value);
      let data = await Email.findOne({ googleId: profile.id });
      if (data === null) {
        let newData = new Email({
          googleId: profile.id,
          email: profile.emails[0].value,
        });
        await newData.save();
      }
      // yeh wala section new hai, taking email from user and saving it to Email model
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
  passport.authenticate("google", {
    scope: ["profile", "email"],
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
  let data2 = await Email.findOne({ googleId: req.user.googleId });
  let userEmail = data2.email;
  let username = req.user.username;
  if (data === null) {
    userFirstTime = false;
    return res.render("dashboard", { userFirstTime, username, userEmail });
  }

  let v1 = data.verification1;
  let v2 = data.verification2;
  let v3 = data.verification3;
  let v1_status = data.verification1Status;
  if (v1_status !== process.env.STATUS) {
    return res.render("v1_student_fail", { v1_status });
  }
  res.render("verification", { v1, v2, v3 });
});
app.post("/dashboard", moveNext, async (req, res) => {
  try {
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
    let message = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation</title>
        <style>
          
    
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
    
            .header {
                background-color: #007bff;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }
    
            .header h1 {
                font-size: 24px;
                margin: 0;
            }
    
            .content {
                padding: 30px;
                color: #333;
                text-align: left;
            }
    
            .verification {
                font-weight: bold;
                display: inline-block;
                color: #007bff;
            }
    
            .footer {
                margin-top: 20px;
                text-align: center;
                color: #777;
            }
    
           
            a {
                color: #007bff;
                text-decoration: underline;
            }
    
            
            @media screen and (max-width: 600px) {
                .container {
                    width: 100%;
                }
                .header {
                    padding: 20px 10px;
                }
                .content {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Registration Form Filled</h1>
            </div>
            <div class="content">
                <p>Dear ${req.user.username},</p>
                <p>Thank you for filling out the registration form. Your registration is nearly complete, and we appreciate your interest in our services.</p>
                <p>The verification process involves three steps:</p>
                <ol>
                    <li><div class="verification">Verification 1:</div> By Warden</li>
                    <li><div class="verification">Verification 2:</div> By Academic Section</li>
                    <li><div class="verification">Verification 3:</div> By Assigned Faculty</li>
                </ol>
                <p>Please be patient as the verification process may take up to 1-2 business days. You will receive email notifications after each step is completed. A final confirmation email will be sent once all verifications are successful.</p>
                <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:112115145@cse.iiitp.ac.in">112115145@cse.iiitp.ac.in</a>.</p>
                <p>Thank you for choosing us!</p>
            </div>
            <div class="footer">
                <p>&copy; 2023 BTP-5 IIIT Pune</p>
            </div>
        </div>
    </body>
    </html>
    
    `;
    await sendEmail(
      req.body.email,
      "Thank you for filling out the registration form",
      message
    );
    res.redirect("/dashboard");
  } catch (err) {
    res.status(400).redirect("/dashboard");
  }
});

app.post("/dashboard/fail", moveNext, async (req, res) => {
  if (req.body.ans === "no") {
    return res.redirect("/");
  }
  // delete the user data from student model
  console.log(req.body);
  await Student.findOneAndDelete({ googleId: req.user.googleId });
  return res.redirect("/dashboard");
});
// highly___protected/admin routes starts from here  //

app.get("/v1", moveNext, async (req, res) => {
  /*
  This is currently just a prototype,
  so anyone can access this route and
  verify the v1 process of students.
  However, this will change in the future. 🧑‍💻🧑‍💻🤗*/
  let data = await Student.find({});
  res.render("v1", { data });
});
app.get("/v1/:id", moveNext, async (req, res) => {
  let data = await Student.findOne({ googleId: req.params.id });
  if (data == null) {
    return res.redirect("/v1");
  }
  res.render("v1_student", {
    username: data.username,
    googleId: data.googleId,
    misNo: data.misNo,
    semester: data.semester,
    currentYear: data.currentYear,
    messFee: data.messFee,
  });
});

app.post("/v1/:id", moveNext, async (req, res) => {
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
app.get("/v1/:id/fail", moveNext, async (req, res) => {
  let data = await Student.findOne({ googleId: req.params.id });
  if (data === null) {
    return res.redirect("/v1");
  }
  let username = data.username;
  console.log(username);
  res.render("v1_fail", { username, googleId: req.params.id });
});
app.post("/v1/:id/fail", moveNext, async (req, res) => {
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

// invalid route ke liye //
app.get("*", (req, res) => {
  res.status(404).render("error_404");
});
// invalid route ke liye //
// app.post("/v1", moveNext, async (req, res) => {
//   console.log("/v1 post route");

//   return res.redirect("/v1");
// });

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
