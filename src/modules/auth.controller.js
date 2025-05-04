const userModel = require("../models/user");
const jwt = require('jsonwebtoken');
const { errorResponse, successResponse } = require("../utils/responses");

exports.showRegisterPage = async (req , res) => {
  return res.render('auth/register')
}


exports.register = async (req, res, next) => {
  try {
    const { email, username, name, password } = req.body;

    const isUserExist = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserExist) {
      // return errorResponse(res, 422, "UserName or Email already exist !!");

      req.flash("error", "UserName or Email already exist !!");

      return res.redirect('/auth/register')
    }

    const isFirstUser = (await userModel.countDocuments()) === 0;
    let role = "USER";

    if (isFirstUser) {
      role = "ADMIN";
    }

    let user = new userModel({ email, username, password, name , role });

    user = await user.save();

    let accessToken = jwt.sign({ username, email }, process.env.JWT_SECRET , {
      expiresIn: "30day"
    });

    res.cookie("token" , accessToken , {
      maxAge: 900000 ,
      httpOnly: true 
    })

    const userObj = user.toObject()

    delete userObj.password
    delete userObj.__v

    // return successResponse(res, 201, {
    //   message: "User registered successfully !!",
    //   user: userObj,
    //   accessToken
    // });


    req.flash("success", "User registered successfully !!");
    return res.redirect("/auth/register");


  } catch (error) {
    next(error);
  }
};
