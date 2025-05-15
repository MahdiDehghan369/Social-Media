const userModel = require("../../models/user");
const bcrypt = require("bcrypt");

exports.getEditProfilePage = async (req, res, next) => {
  try {
    const user = req.user;

    const userInfo = await userModel
      .findOne(
        { _id: user._id },
        " _id name username email biography profilePicture"
      )
      .lean();

    return res.render("user/editProfile", {
      userInfo,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, biography, username, password } = req.body;
    const userId = req.user._id;
    const isEmailExists = await userModel.findOne({ email }).lean();

    if (isEmailExists) {
      if (isEmailExists._id.toString() !== userId.toString()) {
        req.flash("error", "Email already exists :)");
        return res.redirect("/user/edit-profile");
      }
    }

    const isUsernameExists = await userModel.findOne({ username }).lean();
    if (isUsernameExists) {
      if (isUsernameExists._id.toString() !== userId.toString()) {
        req.flash("error", "Username already exists :)");
        return res.redirect("/user/edit-profile");
      }
    }

    const updateData = {
      name,
      email,
      username,
      biography,
    };

    if (password) {
      updateData.password = await bcrypt.hashSync(password, 10);
    }

    if (req.file) {
      updateData.profilePicture = `images/profiles/${req.file.filename}`;
    }

    console.log(updateData);

    const userUpdate = await userModel.findOneAndUpdate(
      { _id: userId },
      updateData
    );

    if (!userUpdate) {
      req.flash("error", "Server Error !!");
      return res.redirect("/user/edit-profile");
    }

    req.flash("success", "Profile user updated successfully :) ");
    return res.redirect("/user/edit-profile");
  } catch (error) {
    next(error);
  }
};
