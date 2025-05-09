const hasAccess = require("../../utils/hasAccessToPage");
const followModel = require("../../models/follow");
const userModel = require("../../models/user");

exports.getPage = async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const user = req.user;

    const followed = await followModel.findOne({
      follower: user._id,
      following: pageId,
    });

    if (!(await hasAccess(user._id, pageId))) {
      req.flash("error", "You have not access to see this page :)");
      return res.render("page/page.ejs", {
        followed: Boolean(followed),
        pageId,
      });
    }
    return res.render("page/page.ejs", {
      followed: Boolean(followed),
      pageId,
    });
  } catch (error) {
    next(error);
  }
};

exports.follow = async (req, res, next) => {
  try {
    const user = req.user;
    const { pageId } = req.params;

    if (user._id.toString() === pageId) {
      req.flash("error", "You can not follow your page :) ");
      return res.redirect(`/page/${pageId}`);
    }

    const existFollow = await followModel.findOne({
      follower: user._id,
      following: pageId,
    });

    if (existFollow) {
      req.flash("error", "You already followed this page :) ");
      return res.redirect(`/page/${pageId}`);
    }

    const followdPage = new followModel({
      follower: user._id,
      following: pageId,
    });

    await followdPage.save();

    req.flash("success", " Followd successfully :) ");
    return res.redirect(`/page/${pageId}`);
  } catch (error) {
    next(error);
  }
};

exports.unFollow = async (req, res, next) => {
  try {
    const user = req.user;
    const { pageId } = req.params;

    const unFollowedPage = await followModel.findOneAndDelete({
      follower: user._id,
      following: pageId,
    });

    if (!unFollowedPage) {
      req.flash("error", "You did not follow this page :) ");
      return res.redirect(`/`);
    }

    req.flash("success", "Page unfollowed successfully :) ");
    return res.redirect(`/page/${pageId}`);
  } catch (error) {
    next(error);
  }
};
