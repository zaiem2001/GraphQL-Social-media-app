import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import cors from "cors";
import { readFile } from "fs/promises";

import User from "./models/User.js";
import { MONGO_URL, PORT } from "./environment.js";
import { resolvers } from "./resolvers/index.js";
import { Authenticate } from "./middlewares/Auth.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(Authenticate);

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });

const context = async ({ req }) => {
  if (req.auth) {
    const user = await User.findById(req.auth).select("-password");
    return user ? { user } : {};
  } else return {};
};

const typeDefs = await readFile("./schema/schema.graphql", "utf8");

const apolloServer = new ApolloServer({ typeDefs, resolvers, context });

await apolloServer.start();
apolloServer.applyMiddleware({ app, path: "/graphql" });

app.listen(PORT, () => {
  console.log("server is running on PORT: " + PORT);
  console.log(`graphQL is running on http://localhost:${PORT}/graphql`);
});
