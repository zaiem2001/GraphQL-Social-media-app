import User from "../models/User.js";
import Post from "../models/Post.js";
import { rejectIf } from "../helpers/helpers.js";

import {
  createUser,
  followUnfollowUser,
  getAllUsers,
  getSingleUser,
  login,
} from "./Users.js";
import { commentOnPost, createPost, likeUnlikePost } from "./Post.js";

export const resolvers = {
  Query: {
    hello: () => "Hello world",

    users: getAllUsers,
    user: getSingleUser,
  },

  Mutation: {
    createUser,
    followUnfollowUser,
    login,

    createPost,
    likeUnlikePost,
    commentOnPost,
  },

  User: {
    posts: async (
      user,
      { first = 3, page = 1, after },
      { user: currentUser }
    ) => {
      rejectIf(!currentUser, "You must be logged in to do that");

      const whereOptions = after
        ? {
            $where: "this.createdAt < " + after,
          }
        : {};

      const totalCount = await Post.countDocuments({ user: user._id });

      let posts = await Post.find({
        user: user._id,
        ...whereOptions,
      })
        .limit(first + 1)
        .sort({ createdAt: -1 });

      const hasNextPage = posts.length > first;
      const hasPreviousPage = page > 1;

      posts = hasNextPage ? posts.slice(0, -1) : posts;

      return {
        totalCount,
        edges: posts.map((post) => ({
          cursor: post.createdAt,
          node: post,
        })),
        pageInfo: {
          startCursor: posts[0] ? posts[0].createdAt : null,
          endCursor: posts[posts.length - 1].createdAt,
          hasNextPage,
          hasPreviousPage,
        },
      };
    },

    followers: async (user, _args, { user: currentUser }) => {
      rejectIf(!currentUser, "You must be logged in to do that");

      return await User.find({ _id: { $in: user.followers } });
    },

    followings: async (user, _args, { user: currentUser }) => {
      rejectIf(!currentUser, "You must be logged in to do that");

      return await User.find({ _id: { $in: user.followings } });
    },
  },

  Post: {
    user: async (post, _args, { user }) => {
      rejectIf(!user, "You must be logged in to do that");
      return await User.findById(post.user);
    },

    likes: async (post, _args, { user }) => {
      rejectIf(!user, "You must be logged in to do that");
      return await User.find({ _id: { $in: post.likes } });
    },

    comments: async (post, _args, { user }) => {
      rejectIf(!user, "You must be logged in to do that");

      const foundPost = await Post.findById(post._id).populate(
        "comments.user",
        "name profilePic"
      );

      const comments = foundPost.comments;
      let updatedComments = [];

      if (comments.length) {
        updatedComments = comments.map((item) => {
          return {
            ...item._doc,
            id: item._id,
            name: item.user.name,
            profilePic: item.user.profilePic,
            // user: null,
          };
        });
      }

      return updatedComments;
    },
  },
};
