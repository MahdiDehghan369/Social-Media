const postModel = require('../../models/post')

exports.showPageCraetePost = async(req , res) => {
    return res.render('uploadPost/uploadPost.ejs')
}

exports.createPost = async(req , res , next) => {
    try {
        const { description, hashtags } = req.body;
        const tags = hashtags.split(',')
        const user = req.user

        if(!req.file){
            req.flash("error" , "Media is required !!")
            return res.render("uploadPost/uploadPost");
        }

        const postUrlPath = `images/post/${req.file.filename}`
        const fileName = req.file.filename

        const post = new postModel({
            media: {
                path: postUrlPath,
                fileName
            },
            description,
            hashtags: tags,
            user: user._id
        });

        await post.save()

        req.flash("success" , "Created post successfully !!")
        return res.render("uploadPost/uploadPost");
        
    } catch (error) {
        next(error)
    }

}