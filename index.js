const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const _ = require('lodash');

const {
  forEach
} = require("lodash");



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const posts =[]



app.get("/", function (req, res) {
  res.render("home", {
  });
});



app.get("/blog", function (req, res) {
  res.render("blog", {
    posts: posts
  });
});




//blog posts
app.get("/compose", function (req, res) {
  res.render("compose", {});
});

var today = new Date();
var dd = today.getDate();

var mm = today.getMonth()+1; 
var yyyy = today.getFullYear();
if(dd<10) 
{
    dd='0'+dd;
} 

if(mm<10) 
{
    mm='0'+mm;
} 

today = dd+'/'+mm+'/'+yyyy;

app.post("/compose", function (req, res) {
  const post = {
    title: req.body.postTitle,
    dateposted: today,
    post: req.body.postBody
  }
  posts.push(post)
  res.redirect("/blog")
});


app.get('/posts/:postname', (req, res) => {
  const searchedTitle = req.params.postname
  posts.forEach(post => {
    if (_.lowerCase(post.title) === _.lowerCase(searchedTitle)) {
      res.render('post', {
        title: post.title,
        dateposted: post.dateposted,
        post: post.post
      });
    
    }
  });
    
})


app.get("/contact", function (req, res) {
  res.render("contact", {});
});

app.get("/about", function (req, res) {
  res.render("about", {});
});








app.listen(3000, function () {
  console.log("Server started on port 3000");
});

