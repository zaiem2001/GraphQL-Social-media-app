import { UserInputError } from "apollo-server-express";

export const rejectIf = (condition, message) => {
  if (condition) {
    throw new Error(message);
  }
};
