const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const { isLoggedIn } = require("../middleware.js");

// Like / Unlike
router.post("/listings/:id/wishlist", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id);
  const id = req.params.id;

  const exists = user.wishlist.some((w) => w.equals(id));
  if (exists) {
    user.wishlist.pull(id);
    req.flash("success", "Wishlist se hata diya");
  } else {
    user.wishlist.push(id);
    req.flash("success", "Wishlist me add ho gaya");
  }
  await user.save();
  res.redirect(req.get("Referer") || "/listings");
});

// Meri Wishlist
router.get("/wishlist", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.render("listings/wishlist", { wishlist: user.wishlist.filter(Boolean) });
});

module.exports = router;