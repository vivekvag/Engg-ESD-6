require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require('md5');
const session = require('express-session');
// const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const stripe = require('stripe')(process.env.STRIPE_SECRET_API);
const cookieParser = require('cookie-parser');
const fs = require('fs'); 
const path = require('path'); 
const multer = require('multer'); 
const app = express();
var request = require('request');

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser());

app.set('trust proxy', 1) // trust first proxy

let random = Math.floor(Math.pow(Math.random(),3)*100000000);
// console.log(random);
let amount = 0, message;

var url=process.env.MONGOD_API;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    address: String,
    dob: String,
    password: String,
});

const User = new mongoose.model('User', userSchema);

app.get('/', function(req,res){
    res.render('home');
});
app.get('/login', function(req,res){
    res.render('login');
});
app.get('/register', function(req,res){
    res.render('register');
});
app.post("/register", function (req, res) {

    const newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        address: req.body.address,
        dob: req.body.dob,
        password: md5(req.body.password)
    })

    newUser.save(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('login');
        }
    });

});

app.post("/login", function (req, res) {
    const email = req.body.email;
    const password = md5(req.body.password);

    res.cookie("userLogin", email);
    // console.log(req.cookie);
    User.findOne({ email: email }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser) {
                if (foundUser.password === password) {
                    let admin_email = process.env.ADMIN_EMAIL;
                    if (foundUser.email === admin_email) {
                        res.redirect('/login');
                    }
                    else {
                        userLogin = email;
                        res.redirect('/');     
                    }
                }
                else {
                    res.redirect('/login');
                    console.log('Wrong password');
                }
            }
        }
    })
});

app.post("/submit-code",function(req,res){
        var program = {
        script : req.body.code,
        language: "python3",
        versionIndex: "3",
        clientId: process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET
    };
    request({
        url: 'https://api.jdoodle.com/v1/execute',
        method: "POST",
        json: program
    },
    function (error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
    });
})


app.get("/logout", function (req, res) {
    userLogin = false;
    res.clearCookie('userLogin');
    // console.log(req.cookies);
    res.redirect("/");
});



app.listen(3000, function () {
    console.log("Server started on port 3000.");
});
