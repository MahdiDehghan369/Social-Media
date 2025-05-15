exports.showHomePage = async(req , res , next) => {
    try {
    return res.render("index.ejs");
    } catch (error) {
        next(error)
    }
}