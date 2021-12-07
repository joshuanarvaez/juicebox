const express = require('express');
const postsRouter = express.Router();

// near the top
const { requireUser } = require('./utils');

postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/)
  const postData = {};

  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }

   // add authorId, title, content to postData object
    // this will create the post and the tags for us

  try {
    postData.authorId = req.user.id;
    postData.title = title; 
    postData.content = content;

     // if the post comes back, res.send({ post });
    // otherwise, next an appropriate error object 

    const post = await createPost(postData);
    if(post){
      res.send({ post });
    }else {
      next({
        name:"Post Creation Error",
        message:"Post Creation Error"
      });
    }
   
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  next(); 
});

// NEW
const { getAllPosts, createPost } = require('../db');

// UPDATE
postsRouter.get('/', async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    "posts": []
  });
});


postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost })
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = postsRouter;