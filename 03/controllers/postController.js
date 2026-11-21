const Post = require("../models/postModel");

exports.createPost = async(req, res) => {
    try{
        const {title, body} = req.body;
        const post = new Post({
            title, post
        });
        const savedPost = await post.save();

        res.json({
            post: savedPost
        });
    }
    catch(error){
        return res.status(400).json({
            error: "Error while creating post"
        });
    }
};