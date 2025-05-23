const userModel = require("../../models/user");
const refreshTokenModel = require("../../models/RefreshToken");
const resetPasswordModel = require("../../models/resetPassword");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { errorResponse, successResponse } = require("../../utils/responses");

exports.showRegisterPage = async (req, res) => {
  return res.render("auth/register");
};

exports.register = async (req, res, next) => {
  try {
    const { email, username, name, password } = req.body;

    const isUserExist = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserExist) {
      // return errorResponse(res, 422, "UserName or Email already exist !!");

      req.flash("error", "UserName or Email already exist !!");

      return res.redirect("/auth/register");
    }

    const isFirstUser = (await userModel.countDocuments()) === 0;
    let role = "USER";

    if (isFirstUser) {
      role = "ADMIN";
    }

    let user = new userModel({ email, username, password, name, role });

    user = await user.save();

    let accessToken = jwt.sign({ username, email }, process.env.JWT_SECRET, {
      expiresIn: "30day",
    });

    const refreshToken = await refreshTokenModel.createToken(user);

    res.cookie("Access-Token", accessToken, {
      maxAge: 900000,
      httpOnly: true,
    });

    res.cookie("Refresh-Token", accessToken, {
      maxAge: 900000,
      httpOnly: true,
    });

    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.__v;

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

exports.showLoginPage = (req, res) => {
  return res.render("auth/login");
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).lean();

    if (!user) {
      req.flash("error", "User Not Found !!");
      return res.redirect("/auth/login");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      req.flash("error", "Invalid Email Or Password");
      return res.redirect("/auth/login");
    }

    const accessToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "30day",
    });

    const refreshToken = await refreshTokenModel.createToken(user);

    res.cookie("Access-Token", accessToken, {
      httpOnly: true,
      maxAge: 900000,
    });

    res.cookie("Refresh-Token", refreshToken, {
      httpOnly: true,
      maxAge: 900000,
    });

    req.flash("success", "User Loged in successfully !!");
    return res.redirect("/auth/login");
  } catch (error) {
    next(error);
  }
};



exports.refreshToken = async (req , res , next) =>{
  try {

    const {refreshToken} = req.body

    const userId = await refreshToken.verifyToken(refreshToken)

    if(!userId){
      return res.status(404).json({
        message: "User Id not Found !!"
      })
    }

    await refreshToken.findByIdAndDelete({
      token: refreshToken
    })

    const user = await userModel.findOne({
      _id: userId
    })

    if(!user){
      return res.status(404).json({
        message: "User not Found !!",
      });
    }

    const accessToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "30day",
    });

    const newRefreshToken = await refreshToken.createToken(user)

    res.cookie("Access-Token", accessToken, {
      httpOnly: true,
      maxAge: 900000,
    });

    res.cookie("Refresh-Token", newRefreshToken, {
      httpOnly: true,
      maxAge: 900000,
    });
    
  } catch (error) {
    next(error)
  }
}

exports.showForgetPasswordView = async(req , res , next) => {
  return res.render("auth/recovery");
}





exports.showResetPasswordView = async(req , res , next) => {

  return res.render("auth/reset");

  
}


exports.forgetPassword = async (req, res, next) => {
  try {

    const {email} = req.body

    const user = await userModel.findOne({email})

    if(!user){
      req.flash("error" , "User not found !!")
      return res.redirect("/auth/forget-password")
    }

    const resetToken = crypto.randomBytes(32).toString("hex")

    const resetTokenExpireTime = Date.now() + 1000 * 60 * 10

    const resetPassword = new resetPasswordModel({
      user: user._id,
      token: resetToken,
      tokenExpireTime: resetTokenExpireTime
    });

    await resetPassword.save()

    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: "",
    //     pass: "",
    //   },
    // });


    // const mailOption = {
    //   from: "",
    //   to: email,
    //   subject: "Reset password link for your social account :)",
    //   html: `
    //   <h2> Hi ${user.name} </h2>
    //   <a href=http://127.0.0.1:${process.env.PORT}/auth/reset-password/${resetToken}> Reset Password :) </a>
    //   `,
    // };

    // transporter.sendMail(mailOption)

    req.flash("success" , "Reset Password sent successfully :)")
    return res.redirect(req.get("Referer") || `/page/${user._id}`);

  } catch (error) {
    next(error);
  }
};


exports.resetPassword = async(req , res , next) => {
  try {
    
    const {password , token} = req.body

    const resetPassword = await resetPasswordModel.findOne({
      token,
      tokenExpireTime : {$gt : Date.now()}
    })

    if(!resetPassword){
      req.flash("error" , "Invalid Or Expite Token")
      return res.redirect("/auth/forget-password")
    }

    const user = await userModel.findOne({
      _id: resetPassword.user
    })


    if(!user){
      req.flash("error", "Invalid Or Expite Token");
      return res.redirect("/auth/forget-password");
    }

    const hashPassword = await bcrypt.hashSync(password , 12)

    await userModel.findOneAndUpdate({_id: user._id} , {password : hashPassword})


    req.flash("success" , "Password reset successsfully :)")

    setTimeout(() => {
    return res.redirect("/auth/login");
      
    }, 2000);

  } catch (error) {
    next(error)
  }
}