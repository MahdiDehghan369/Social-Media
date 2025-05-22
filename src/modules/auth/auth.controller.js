const userModel = require("../../models/user");
const refreshTokenModel = require("../../models/RefreshToken");
const jwt = require("jsonwebtoken");
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
  } catch (error) {
    next(error);
  }
};


exports.resetPassword = async(req , res , next) => {
  try {
    
  } catch (error) {
    next(error)
  }
}