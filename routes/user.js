const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
router.get("/signup", (req,res) =>{
    res.render("users/signup.ejs");
});
const passport = require("passport");

router.post("/signup", async (req,res) =>{
    try{
    let {username, email, password} = req.body;
    const newUser = new User({username, email});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.flash("success","Welcome to Wanderlust!");
    res.redirect("/listing");
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});

router.get("/login", (req,res) =>{
    res.render("users/login.ejs");
});

router.post("/login", passport.authenticate("local",{ failureRedirect: "/login", failureFlash: true}), async(req,res) =>{
    req.flash("success","Welcome back!");
    res.redirect("/listing");
});
module.exports = router;