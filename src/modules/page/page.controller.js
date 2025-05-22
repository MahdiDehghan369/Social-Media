const hasAccessToPage = require("../../utils/hasAccessToPage");
const followModel = require("../../models/follow");
const userModel = require("../../models/user");
const postModel = require("../../models/post");
const likeModel = require("../../models/like");
const saveModel = require("../../models/save");
const commentModel = require("../../models/comment");

exports.getPage = async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const user = req.user;

    const followed = await followModel.findOne({
      follower: user._id,
      following: pageId,
    });

    const page = await userModel
      .findOne(
        { _id: pageId },
        " name username biography isVerified biography profilePicture"
      )
      .lean();

    const hasAccess = await hasAccessToPage(user._id, pageId);

    if (!hasAccess) {
      req.flash("error", "You have not access to see this page :)");
      return res.render("page/page.ejs", {
        followed: Boolean(followed),
        pageId,
        followers: [],
        followings: [],
        hasAccess,
        page,
        posts: [],
        comments: [],
        own: false
      });
    }


    let followers = await followModel
      .find({ following: pageId })
      .populate("follower", "name username profilePicture");

      followers = followers.map(item => item.follower)

    let followings = await followModel
      .find({ follower: pageId })
      .populate("following", "name username profilePicture");

    followings = followings.map(item => item.following)

    let posts = await postModel.find({user: pageId} , "-__v -user").sort({_id: -1}).populate("user" , "name username")

    const own = user._id.toString() === pageId


    const likes = await likeModel
      .find({ user: user._id })
      .populate("post", "_id");

    const likedPostIds = likes.map((like) => like.post._id.toString());

    const saves = await saveModel
      .find({ user: user._id })
      .populate("post", "_id");

    const savesPostId = saves.map((save) => save.post._id.toString());

    const postsWithLikeAndSave = posts.map((post) => {
      const postId = post._id.toString();
      return {
        ...post.toObject(),
        hasLike: likedPostIds.includes(postId),
        hasSave: savesPostId.includes(postId),
      };
    });

    const comments = await commentModel
      .find({
        page: pageId,
      })
      .populate("user", "name username profilePicture")
      .lean();

     
    return res.render("page/page.ejs", {
      followed: Boolean(followed),
      pageId,
      followers,
      followings,
      hasAccess,
      page,
      posts: postsWithLikeAndSave,
      own,
      comments
      
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
