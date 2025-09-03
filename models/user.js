const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
});

userSchema.plugin(passportLocalMongoose); // adds username,password fields and methods to userSchema
module.exports = mongoose.model("User",userSchema);