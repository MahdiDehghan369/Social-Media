const {getUserInfo} = require('../../utils/getUserInfo');

exports.showHomePage = async(req , res , next) => {
    try {
        const userId = req.user._id
        const userInfo = await getUserInfo(userId)
    return res.render("index.ejs" , {
        user: userInfo
    });


    


    } catch (error) {
        next(error)
    }
}