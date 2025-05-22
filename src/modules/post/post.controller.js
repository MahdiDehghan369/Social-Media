const postModel = require("../../models/post");
const likeModel = require("../../models/like");
const saveModel = require("../../models/save");
const userModel = require("../../models/user");
const commentModel = require("../../models/comment");

const fs = require("fs");
const path = require("path");

const hasAccessToPage = require("../../utils/hasAccessToPage");
const { getUserInfo } = require("../../utils/getUserInfo");

exports.showPageCraetePost = async (req, res, next) => {
  try {
    return res.render("uploadPost/uploadPost.ejs");
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { description, hashtags, title } = req.body;
    const tags = hashtags.split(",");
    const user = req.user;

    if (!req.file) {
      req.flash("error", "Media is required !!");
      return res.render("uploadPost/uploadPost");
    }

    const postUrlPath = `images/post/${req.file.filename}`;
    const fileName = req.file.filename;

    const post = new postModel({
      media: {
        path: postUrlPath,
        fileName,
      },
      description,
      title,
      hashtags: tags,
      user: user._id,
    });

    await post.save();

    req.flash("success", "Created post successfully !!");
    return res.render("uploadPost/uploadPost");
  } catch (error) {
    next(error);
  }
};

exports.like = async (req, res, next) => {
  try {
    const user = req.user;
    const { postId } = req.body;

    const post = await postModel.findOne({ _id: postId });

    if (!post) {
      req.flash("error", "No exist post :)");
      return res.redirect(`/page/${post.user.toString()}`);
    }

    const hasAccess = await hasAccessToPage(user._id, post.user.toString());

    if (!hasAccess) {
      req.flash("error", "You don not access to like this post :)");
      return res.redirect(`/page/${post.user.toString()}`);
    }

    const existingLike = await likeModel.findOne({
      post: postId,
      user: user._id,
    });

    if (existingLike) {
      return res.redirect(`/page/${post.user.toString()}`);
    }

    const like = new likeModel({
      post: postId,
      user: user._id,
    });

    console.log(like);

    await like.save();

    return res.redirect(`/page/${post.user.toString()}`);
  } catch (error) {
    next(error);
  }
};

exports.disLike = async (req, res, next) => {
  try {
    const user = req.user;
    const { postId } = req.body;

    const post = await postModel.findOne({ _id: postId });

    if (!post) {
      req.flash("error", "No exist post :)");
      return res.redirect("back");
    }

    const like = await likeModel.findOne({ user: user._id, post: postId });

    if (!like) {
      return res.redirect(`/page/${post.user.toString()}`);
    }

    const hasAccess = await hasAccessToPage(user._id, post.user.toString());

    if (!hasAccess) {
      req.flash("error", "You do not access to disLike this post :)");
      return res.redirect(`/page/${post.user.toString()}`);
    }

    const disLikePost = await likeModel.findOneAndDelete({
      user: user._id,
      post: postId,
    });

    if (!disLikePost) {
      req.flash("error", "DisLike Not Successfully !!");
      return res.redirect(`/page/${post.user.toString()}`);
    }

    return res.redirect(`/page/${post.user.toString()}`);
  } catch (error) {
    next(error);
  }
};

exports.save = async (req, res, next) => {
  try {
    const user = req.user;
    const { postId } = req.body;

    const post = await postModel.findOne({
      _id: postId,
    });

    if (!post) {
      req.flash("error", "There is no post with this ID :)");
      return res.redirect(`/page/${post.user.toString()}`);
    }

    const hasAccess = await hasAccessToPage(user._id, post.user.toString());

    if (!hasAccess) {
      req.flash("error", "You don not access to like this post :)");
      return res.redirect(`/page/${post.user.toString()}`);
    }

    const savePost = new saveModel({
      post: postId,
      user: user._id,
    });

    await savePost.save();

    return res.redirect(`/page/${post.user.toString()}`);
  } catch (error) {
    next(error);
  }
};

exports.unSave = async (req, res, next) => {
  try {
    const user = req.user;
    const { postId } = req.body;

    const post = await postModel.findOne({ _id: postId });
    if (!post) {
      req.flash("error", "No exist post :)");
      return res.redirect(`/page/${post.user.toString()}`);
    }

    const hasAccess = await hasAccessToPage(user._id, post.user.toString());

    if (!hasAccess) {
      req.flash("error", "You don not access to like this post :)");
      return res.redirect(`/page/${post.user.toString()}`);
    }

    const existingSave = await saveModel.findOne({
      post: postId,
      user: user._id,
    });

    if (!existingSave) {
      return res.redirect(`/page/${post.user.toString()}`);
    }

    const unSavePost = await saveModel.findOneAndDelete({
      user: user._id,
      post: postId,
    });

    if (!unSavePost) {
      req.flash("error", "Un save Not Successfully !!");
      return res.redirect(`/page/${post.user.toString()}`);
    }

    return res.redirect(`/page/${post.user.toString()}`);
  } catch (error) {
    next(error);
  }
};

exports.savesPost = async (req, res, next) => {
  try {
    const user = req.user;
    const savesByUser = await saveModel
      .find({ user: user._id })
      .populate({
        path: "post",
        populate: {
          path: "user",
          model: "user",
        },
      })
      .lean();

    const likesByUser = await likeModel
      .find({ user: user._id })
      .populate("post")
      .lean();

    savesByUser.forEach((save) => {
      likesByUser.forEach((like) => {
        if (save.post._id.toString() == like.post._id.toString()) {
          save.post.hasLike = true;
        }
      });
    });

    const userInfo = await getUserInfo(user._id);

    return res.render("bookmarks/index.ejs", {
      posts: savesByUser,
      user: userInfo,
    });
  } catch (error) {
    next(error);
  }
};

exports.removePost = async (req, res, next) => {
  try {
    const user = req.user;
    const { postId } = req.params;

    const post = await postModel.findOne({
      _id: postId,
    });

    if (!post || post.user.toString() !== user._id.toString()) {
      req.flash("error", "You can not remove this post !!");
      return res.redirect(`/page/${user._id}`);
    }

    const mediaPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "public",
      "images",
      "post",
      post.media.fileName
    );

    fs.unlinkSync(mediaPath, (err) => {
      if (err) next(err);
    });

    await saveModel.deleteMany({ post: postId });
    await likeModel.deleteMany({ post: postId });
    // await commentModel.deleteMany({post: postId})

    await postModel.findByIdAndDelete({
      _id: postId,
    });

    req.flash("success", "Post removed successfully :)");
    return res.redirect(`/page/${user._id}`);
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const user = req.user;
    const { content, postId, pageId } = req.body;

    if (!content || content.trim().length === 0) {
      req.flash("error", "Please type something in the input :)");
      return res.redirect(req.get("Referer") || `/page/${user._id}`);
    }

    if (!user.isVerified) {
      req.flash("error", "Please verify your account !!");
      return res.redirect(req.get("Referer") || `/page/${user._id}`);
    }

    const isPostExist = await postModel.findOne({ _id: postId }).lean();
    if (!isPostExist) {
      req.flash("error", "There is no post !!");
      return res.redirect(req.get("Referer") || `/page/${user._id}`);
    }

    const isPageExist = await userModel.findOne({ _id: pageId }).lean();
    if (!isPageExist) {
      req.flash("error", "There is no page !!");
      return res.redirect(req.get("Referer") || `/page/${user._id}`);
    }

    const comment = new commentModel({
      content: content.trim(),
      page: pageId,
      post: postId,
      user: user._id,
    });

    await comment.save();

    req.flash("success", "Comment added successfully :)");
    return res.redirect(req.get("Referer") || `/page/${user._id}`);
  } catch (error) {
    next(error);
  }
};
