const { default: mongoose } = require("mongoose");
const userModel = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const { pageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pageId)) {
      req.flash("error", "Invalid page ID");
      return res.redirect("/");
    }

    const existPage = await userModel.findOne({
      _id: pageId
    });

    if (!existPage) {
      req.flash("error", "We do not have page with this id :) ");
      return res.redirect("/");
    }

    next();
  } catch (error) {
    next(error);
  }
};
