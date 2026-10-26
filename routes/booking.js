const express = require("express");
const router = express.Router();
const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");

// Book karo
router.post("/listings/:id/book", isLoggedIn, async (req, res) => {
  const { checkIn, checkOut } = req.body;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const today = new Date().setHours(0, 0, 0, 0);

  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing nahi mili");
    return res.redirect("/listings");
  }
  if (listing.owner && listing.owner.equals(req.user._id)) {
    req.flash("error", "Apni hi listing book nahi kar sakte");
    return res.redirect(`/listings/${listing._id}`);
  }
  if (isNaN(inDate) || isNaN(outDate) || outDate <= inDate || inDate < today) {
    req.flash("error", "Dates sahi nahi hain");
    return res.redirect(`/listings/${listing._id}`);
  }

  // In dates par pehle se booking to nahi?
  const clash = await Booking.findOne({
    listing: listing._id,
    status: "confirmed",
    checkIn: { $lt: outDate },
    checkOut: { $gt: inDate },
  });
  if (clash) {
    req.flash("error", "In dates par listing already booked hai");
    return res.redirect(`/listings/${listing._id}`);
  }

  const nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
  await Booking.create({
    listing: listing._id,
    user: req.user._id,
    checkIn: inDate,
    checkOut: outDate,
    totalPrice: nights * listing.price,
  });

  req.flash("success", "Booking confirm ho gayi!");
  res.redirect("/bookings");
});

// Meri bookings
router.get("/bookings", isLoggedIn, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort("-createdAt");
  res.render("bookings/index", { bookings });
});

// Cancel
router.post("/bookings/:id/cancel", isLoggedIn, async (req, res) => {
  await Booking.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { status: "cancelled" }
  );
  req.flash("success", "Booking cancel ho gayi");
  res.redirect("/bookings");
});

module.exports = router;