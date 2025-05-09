const followModel = require("../models/follow");
const userModel = require("../models/user");

module.exports = async (userId, pageId) => {
  try {
    if (userId.toString() === pageId) {
      return true;
    }

    const page = await userModel.findOne({ _id: pageId });
    if (!page) return false;

    const followed = await followModel.findOne({
      follower: userId,
      following: pageId,
    });

    if (page.private && !followed) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in checkAccess:", error);
    return false;
  }
};
