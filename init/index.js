const mongoose = require("mongoose");
const initdata = require("./data.js");
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const Listing = require("../models/listing.js");
async function main() {
    await mongoose.connect(MONGO_URL);
};
main()
    .then(()=>{
        console.log("connected to DB");
    })
    .catch((err)=>{
        console.log(err);
    });
const initDB = async () =>{
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log("Data was initialised");
};
initDB();