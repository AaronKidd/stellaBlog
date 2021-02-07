const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const _ = require('lodash');
const mongoose = require('mongoose')


mongoose.connect(process.env.SECRET, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})


//schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  dateposted: {
    type: String,
  },
  content: mongoose.Schema.Types.Mixed
})


//model
const Post = mongoose.model("Post", postSchema);



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));




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




//blog posts
app.get("/compose", function (req, res) {
  res.render("compose", {});
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


app.get("/contact", function (req, res) {
  res.render("contact", {});
});

app.get("/about", function (req, res) {
  res.render("about", {});
});


let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000
}

app.listen( port, function () {
  console.log("Server started");
});
