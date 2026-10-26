if(process.env.NODE_ENV!="production"){

require('dotenv').config();
}



const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const cors=require("cors");
const {listingSchema,reviewSchema}=require("./Schema.js");
const Review = require("./models/review.js");
const listingRouter=require("./routes/listing.js");
const session = require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const { register } = require("module");
const userRouter=require("./routes/user.js");
const { isLoggedIn, isReviewAuthor } = require("./middleware.js");
const wishlistRouter=require("./routes/wishlist.js");
const bookingRouter=require("./routes/booking.js");
const dashboardRouter=require("./routes/dashboard.js");


const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

//const dbUrl=process.env.ATLASDB_URL;


main()
.then(()=>{
    console.log("connected to DB");

    })
    .catch((err)=>{
        console.log(err);
     });

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(cors());

const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expiress:Date.now()+7 * 24 * 60 * 60 * 1000, 
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    },
};



//app.get("/" ,(req,res)=>{
  //  res.send("Hii, I am root");
//});

app.use(session(sessionOptions));
app.use(flash());

//Authenicate//
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});
app.use (async(req,res,next)=>{
  res.locals.wishlistIds = [];
  if (req.user) {
    const u = await User.findById(req.user._id).select("wishlist");
    res.locals.wishlistIds = u.wishlist.map((w) => w.toString());
  }
  next();
});

//app.get("/demouser", async(req,res)=>{
   // let fakeUser=new User({
    //    email:"student@gmail.com",
     //   username:"delta-student"
   // });
//  let registeredUser = await User.register(fakeUser,"helloworld");
//  res.send(registeredUser);

//});




const validateReview=(req,res,next)=>{
    let{error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
        
    }else{
        next();
    }
};

app.use("/listings",listingRouter);
app.use("/dashboard",dashboardRouter);
app.use("/", userRouter);

//Reviews
//Post Review Route
     app.post("/listings/:id/reviews", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created !");
    res.redirect(`/listings/${listing._id}`);
}));

//Delete Review Route

app.delete("/listings/:id/reviews/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(async(req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId} });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","New Review Deleted!");
    res.redirect(`/listings/${id}`);
}));








//app.get("/testListing",async(req,res)=>{
    //let sampleListing=new Listing({
       // title:"my new villa",
      //  description:"by the beach",
      //  price:1200,
       // location:"calangute,Goa",
     //   country:"india",

   // });
    //await sampleListing.save();
   // console.log("sample was saves");
   // res.send("successful testing");


//});





app.use("/",wishlistRouter);
app.use("/",bookingRouter);
app.all("/*splat",(req,res,next)=>{
    next(new ExpressError(404,"page Not found !"));

});
app.use((err,req,res,next)=>{
    let{statusCode=500,message="something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
   // res.status(statusCode).send(message);
});



app.listen(8080,()=>{
    console.log("server is listening to port 8080");

});
