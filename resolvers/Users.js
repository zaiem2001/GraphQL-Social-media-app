import bcrypt from "bcrypt";

import { UserInputError } from "apollo-server-express";

import User from "../models/User.js";
import { rejectIf } from "../helpers/helpers.js";
import generateToken from "../helpers/generateToken.js";

export const createUser = async (_, { input }) => {
  const { name, email, password, profilePic } = input;

  rejectIf(!name.trim(), "Name is required");
  rejectIf(!email.trim(), "Email is required");
  rejectIf(!profilePic.trim(), "profile picture is required.");
  rejectIf(password.trim().length < 8, "Password must be 8 characters or more");

  const existingUser = await User.findOne({ email });
  rejectIf(existingUser, "User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    profilePic,
  });

  await newUser.save();

  return newUser;
};

export const login = async (_, { email, password }, context) => {
  rejectIf(!email.trim(), "Email is required");
  rejectIf(!password.trim(), "Password is required");

  const user = await User.findOne({ email });
  rejectIf(!user, "User does not exist");

  try {
    const isValidPassword = await bcrypt.compare(password, user.password);
    // if (!isValidPassword) throw new UserInputError("Invalid password");
    rejectIf(!isValidPassword, "Invalid Username or Password!");

    const token = generateToken(user._id);

    return {
      token,
      user,
    };
  } catch (error) {
    rejectIf(error.message, "Invalid Username or Password!");
  }
};

export const getAllUsers = async (_, _args, { user }) => {
  rejectIf(!user, "You must be logged in to do that");
  // rejectIf(!user.isAdmin, "You must be an admin to do that");

  return await User.find({});
};

export const getSingleUser = async (_, { id }, { user: currentUser }) => {
  rejectIf(!currentUser, "You must be logged in to do that");

  const user = await User.findById(id).select("-password");
  rejectIf(!user, "User does not exist");

  const isAFollower = currentUser.followers.includes(user._id);
  const alreadyFollowing = currentUser.followings.includes(user._id);

  return {
    ...user._doc,
    id: user._id,
    isAFollower,
    alreadyFollowing,
  };
};

export const followUnfollowUser = async (
  _,
  { userId },
  { user: currentUser }
) => {
  rejectIf(!currentUser, "You must be logged in to do that");

  rejectIf(currentUser._id.toString() === userId, "You cannot follow yourself");

  const user = await User.findById(userId);
  const activeUser = await User.findById(currentUser._id);

  rejectIf(!user, "User does not exist");

  let alreadyFollowing = currentUser.followings.includes(userId);

  if (alreadyFollowing) {
    user.followers = user.followers.filter(
      (item) => item.toString() !== currentUser._id.toString()
    );

    activeUser.followings = activeUser.followings.filter(
      (item) => item.toString() !== userId.toString()
    );
  } else {
    user.followers.push(currentUser._id);
    activeUser.followings.push(userId);
  }

  const updatedUser = await user.save();
  await activeUser.save();

  const isAFollower = activeUser.followers.includes(userId);
  alreadyFollowing = !alreadyFollowing;

  return {
    ...updatedUser._doc,
    id: updatedUser._id,
    isAFollower,
    alreadyFollowing,
  };
};
