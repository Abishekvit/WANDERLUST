const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const Listing = require("./models/listing.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
app.engine("ejs",ejsMate);
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

const validateListing = (req,res,next)=>{
    let result =listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
        let errMsg = result.error.details.map((el)=> el.message).join(",");
        next(new ExpressError(400,result.error));
    }
    else{
        next();
    }
}
// INDEX ROUTE
app.get("/listing", async (req,res) =>{
    const allListings = await Listing.find();
    res.render("listings/index.ejs",{allListings});
});

// NEW ROUTE
app.get("/listing/new", async (req,res) =>{
    res.render("listings/new.ejs");
});

// SHOW ROUTE
app.get("/listing/:id", async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

// CREATE ROUTE
app.post("/listing",validateListing, (async (req,res,next)=>{
    // let {title,description,image,price,country,location} = req.body;
    try{
    const newListing = new Listing (req.body.listing);
    await newListing.save();
    console.log(req.body);
    res.redirect("/listing");
} catch(err){
    // if(!(req.body.listing)){
    next(new ExpressError(454,"Missing data from client side"));
    // }
}
}))

// EDIT ROUTE
app.get("/listing/:id/edit",async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})

// UPDATE ROUTE
app.patch("/listing/:id", async (req,res)=>{
    let {id} =req.params;
    Listing.findByIdAndUpdate(id, req.body.listing)
    .then((res)=>{
        console.log(res);
    })
    .catch((err) =>{
        console.log(err);
    })
    res.redirect(`/listing/${id}`);
})

// DELETE ROUTE
app.delete("/listing/:id",async (req,res)=>{
    let {id} =req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listing");

})
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