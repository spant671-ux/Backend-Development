const express = require("express");
const router = express.Router();

//Import Controller
const { dummyLink } = require("../controllers/LikeController");
const { createComment } = require("../controllers/CommentController");
const { createPost, getAllPosts } = require("../controllers/PostController");

//Create Mapping
router.get("/dummyroute", dummyLink);
router.post("/comments/create", createComment)
router.post("/posts/create", createPost);
router.get("/posts", getAllPosts);

//export
module.exports = router;