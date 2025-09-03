const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");

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
router.get("/", async (req,res) =>{
    const allListings = await Listing.find();
    res.render("listings/index.ejs",{allListings});
});

// NEW ROUTE
router.get("/new", async (req,res) =>{
    res.render("listings/new.ejs");
});

// SHOW ROUTE
router.get("/:id", async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Cannot find that listing!");
        return res.redirect("/listing");
    }
    res.render("listings/show.ejs",{listing});
});

// CREATE ROUTE
router.post("/",validateListing, (async (req,res,next)=>{
    try{
    const newListing = new Listing (req.body.listing);
    await newListing.save();
    console.log(req.body);
    req.flash("success","New Listing Created!");
    res.redirect("/listing");
} catch(err){
    next(new ExpressError(454,"Missing data from client side"));
}
}))

// EDIT ROUTE
router.get("/:id/edit",async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
     if(!listing){
        req.flash("error","Cannot find that listing!");
        return res.redirect("/listing");
    }
    res.render("listings/edit.ejs",{listing});
})

// UPDATE ROUTE
router.patch("/:id", async (req,res)=>{
    let {id} =req.params;
    Listing.findByIdAndUpdate(id, req.body.listing)
    .then((res)=>{
        console.log(res);
    })
    .catch((err) =>{
        console.log(err);
    })
    req.flash("success","Listing updated!");
    res.redirect(`/listing/${id}`);
})

// DELETE ROUTE
router.delete("/:id",async (req,res)=>{
    let {id} =req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listing");

})

module.exports = router;