const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
app.engine("ejs",ejsMate);

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// EXPRESS SESSION
const session = require("express-session");
const flash = require("connect-flash");



async function main() {
    await mongoose.connect(MONGO_URL);
};
app.use(methodOverride("_method"));
main()
    .then(()=>{
        console.log("connected to DB");
    })
    .catch(()=>{
        console.log(err);
    });
app.listen(1010, () =>{
    console.log("server is listening to port 1010");
})

// app.get("/testListing", async (req,res) =>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description:"By the beach",
//         price : 1200,
//         location : "Calangute,Goa",
//         country :"India"
//     });
//     await sampleListing.save();
//     res.send("successful testing");
// });
// 
const sessionOptions ={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7,
        httpOnly:true
    }
};
app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})


// Passport
app.get("/demouser",async (req,res) =>{
    let fakeUser =new User({
        username:"demouser",
        email:"student@gmail.com"
    });
    let registeredUser = await User.register(fakeUser,"helloworld");
    res.send(registeredUser);
});


app.use("/listing",listingRouter);
app.use("/listing/:id/review", reviewRouter);
app.use("/", userRouter);

app.get("/:any",(req,res,next) =>{
    next(new ExpressError(500,"Page Not Found!"));
});
app.use((err,req,res,next)=>{
    let{statusCode=500, message="Error"} = err;
    res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);
});
app.get("/", (req,res) =>{
    res.send("Hi, I am root ");
})
