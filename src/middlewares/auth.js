const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const accessToken = req.cookies["Access-Token"];

    if (!accessToken) {
      req.flash("error", "Please First Login :)");
      return res.redirect("/auth/login");
    }

    const pyload = jwt.verify(accessToken, process.env.JWT_SECRET);

    if (!pyload) {
      req.flash("error", "Please First Login :)");
      return res.redirect("/auth/login");
    }

    const emailUser = pyload.email;
    const user = await userModel
      .findOne({ email: emailUser }, "-password -__v")
      .lean();

    if (!user) {
      req.flash("error", "Please First Login :)");
      return res.redirect("/auth/login");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);    
  }
};
