const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const _ = require('lodash');
const mongoose = require('mongoose')
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.set('view engine', 'ejs');



app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: process.env.PASSPORT,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect(process.env.SECRET, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
mongoose.set("useCreateIndex", true);

//schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  dateposted: {
    type: String,
  },
  content: mongoose.Schema.Types.Mixed
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
  }
});

userSchema.plugin(passportLocalMongoose);

//model
const Post = mongoose.model("Post", postSchema);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.get("/", function (req, res) {
  res.render("home", {});
});



app.get("/blog", function (req, res) {
  Post.find((err, results) => {
    if (err) {
      console.log(err)
    } else {
      res.render("blog", {
        posts: results
      });
    }

  })
});

app.get("/admin", function (req, res) {
  Post.find((err, results) => {
    if (err) {
      console.log(err)
    } else {
      res.render("admin", {
        posts: results
      });
    }

  })
});





//blogpost
app.get("/compose", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("compose");
  } else {
    res.redirect("/login")
  }
});

var today = new Date();
var dd = today.getDate();

var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();
if (dd < 10) {
  dd = '0' + dd;
}

if (mm < 10) {
  mm = '0' + mm;
}

today = dd + '/' + mm + '/' + yyyy;

app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    dateposted: today,
    content: req.body.postBody
  })
  post.save();

  res.redirect("/blog")
});


app.get('/posts/:postId', (req, res) => {
  const requestedid = req.params.postId
  Post.findOne({
    _id: requestedid
  }, (err, post) => {
    if (err) {
      console.log(err)
    } else {
      res.render('post', {
        title: post.title,
        dateposted: post.dateposted,
        content: post.content
      });
    }
  })
})

app.get('/postadmin/:postId', (req, res) => {
  if (req.isAuthenticated()) {
    const requestedid = req.params.postId
    Post.findOne({
      _id: requestedid
    }, (err, post) => {
      if (err) {
        console.log(err)
      } else {
        res.render('postAdmin', {
          id: requestedid,
          title: post.title,
          dateposted: post.dateposted,
          content: post.content
        });
      }
    })
  } else {
    res.redirect("/login")
  }


})

app.post("/delete", (req, res) => {
  if (req.isAuthenticated()) {
    const postId = req.body.deletebtn
    console.log(postId)

    Post.deleteOne({
      _id: postId
    }, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log("post deleted")
        res.redirect("/admin")
      }
    })
  } else {
    res.redirect("/login")
  }
})

app.post("/update", (req, res) => {
  if (req.isAuthenticated()) {
    const postId = req.body.edit
    const content = req.body.postBody
    console.log(postId)
    Post.updateOne({
      _id: postId
    }, {
      content: req.body.postBody
    }, (err) => {
      if (err) {
        console.log(err)
        console.log("something went wrong")
      } else {
        console.log("post edited")
        res.redirect("/admin")
      }
    })
  } else {
    res.redirect("/login")
  }


})

app.get("/dashboard", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("dashboard");
  } else {
    res.redirect("/login")
  }
});

app.get("/contact", function (req, res) {
  res.render("contact", {});
});

app.get("/about", function (req, res) {
  res.render("about", {});
});


app.get("/login", (req, res) => {
  res.render("login")
})

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user, (err) => {
    if (err) {
      console.log(err)
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/dashboard")
      })
    }
  })

})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000
}

app.listen(port, function () {
  console.log("Server started");
});