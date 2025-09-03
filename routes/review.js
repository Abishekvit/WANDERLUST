const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const validateReview = (req,res,next)=>{
    let result =reviewSchema.validate(req.body);
    console.log(result);
    if(result.error){
        let errMsg = result.error.details.map((el)=> el.message).join(",");
        next(new ExpressError(400,result.error));
    }
    else{
        next();
    }
}

// Reviews
// POST ROUTE

router.post("/", validateReview ,wrapAsync(async (req,res,next) =>{
    let listing = await Listing.findById(req.params.id);
    console.log(req.body.review);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log(newReview);
    req.flash("success","New Review Created!");
    res.redirect(`/listing/${listing._id}`);
}));

// Delete review route
router.delete("/:reviewId", wrapAsync(async (req,res,next) =>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listing/${id}`);
}));


module.exports = router;