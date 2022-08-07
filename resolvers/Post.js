import Post from "../models/Post.js";
import User from "../models/User.js";

import { rejectIf } from "../helpers/helpers.js";

export const createPost = async (_, { input }, { user }) => {
  const { caption, image } = input;

  rejectIf(!user, "You must be logged in to do that");
  rejectIf(!caption.trim(), "Caption is required");
  rejectIf(!image.trim(), "Image is required");

  const newPost = new Post({
    caption,
    image,
    user: user._id,
    comments: [],
  });

  await newPost.save();

  await User.findByIdAndUpdate(user._id, {
    $push: {
      posts: newPost._id,
    },
  });

  return newPost;
};

export const likeUnlikePost = async (_, { postId }, { user }) => {
  rejectIf(!user, "You must be logged in to do that");

  const post = await Post.findById(postId);

  rejectIf(!post, "Post does not exist");
  let updatedPost;

  if (post.likes.includes(user._id)) {
    updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: user._id },
      },
      { new: true }
    );
  } else {
    updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: user._id },
      },
      { new: true }
    );
  }

  return updatedPost;
};

export const commentOnPost = async (_, { postId, comment }, { user }) => {
  rejectIf(!user, "You must be logged in to do that");

  const post = await Post.findById(postId);

  rejectIf(!post, "Post does not exist");

  const newComment = {
    comment,
    user: user._id,
    date: Date.now(),
  };

  const updatedPost = await Post.findByIdAndUpdate(postId, {
    $push: { comments: newComment },
  });

  return updatedPost;
};
