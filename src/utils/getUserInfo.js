const userModel = require('../models/user');

exports.getUserInfo = async(userId) => {
    const userInfo = await userModel.findOne({_id: userId} , "-password").lean()

    return userInfo

}