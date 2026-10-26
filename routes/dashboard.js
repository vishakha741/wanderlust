const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const Listing = require("../models/listing.js");
const Booking=require("../models/booking.js");
const User=require("../models/user.js");

router.get("/", isLoggedIn, async (req, res) => {
  const myListings = await Listing.find({ owner: req.user._id });
  const myBookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });
  const me = await User.findById(req.user._id).populate("wishlist");
  const myWishlist = me.wishlist.filter(Boolean);
  res.render("dashboard.ejs", { myListings, myBookings, myWishlist });
});





module.exports = router;