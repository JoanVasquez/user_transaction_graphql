import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const userResolver = {
  Mutation: {
    signUp: async (_, { input }, context) => {
      try {
        const { username, name, password, gender } = input;

        if (!username || !name || !password || !gender) {
          throw new Error("All fields are required");
        }
        const existingUser = await User.findOne({ username });

        if (existingUser) {
          throw new Error("Username already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const profilePicture = `https://avatar.iran.liara.run/public/${gender}?username=${username}`;

        const newUser = new User({
          username,
          name,
          password: hashedPassword,
          profilePicture,
          gender,
        });

        await newUser.save();
        await context.login(newUser);
        return newUser;
      } catch (err) {
        console.error(`Error in Signup: ${err.message}`);
        throw new Error(err.message || "Internal Server Error");
      }
    },

    login: async (_, { input }, context) => {
      try {
        const { username, password } = input;
        if (!username || !password) {
          throw new Error("All fields are required");
        }
        const { user } = await context.authenticate("graphql-local", {
          username,
          password,
        });
        await context.login(user);
        return user;
      } catch (err) {
        console.error(`Error in Login: ${err.message}`);
        throw new Error(err.message || "Internal Server Error");
      }
    },
    logout: async (_, __, context) => {
      try {
        await context.logout();
        context.req.session.destroy((err) => {
          if (err) throw err;
        });
        context.res.clearCookie("connect.sid");
        return { message: "Logged out successfully" };
      } catch (err) {
        console.error(`Error in Logout: ${err.message}`);
        throw new Error(err.message || "Internal Server Error");
      }
    },
  },
  Query: {
    // users: (_, _, { req, res }) => {
    //   return users;
    // },
    authUser: async (_, __, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (err) {
        console.error(`Error in AuthUser: ${err.message}`);
        throw new Error(err.message || "Internal Server Error");
      }
    },
    user: async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      } catch (err) {
        console.error(`Error in User: ${err.message}`);
        throw new Error(err.message || "Internal Server Error");
      }
    },
  },

  //TODO: ADD USER/TRANSACTION RELATION
  User: {
    transactions: async (parent) => {
      try {
        console.log(parent._id);
        const transactions = await Transaction.find({ userId: parent._id });
        return transactions;
      } catch (err) {
        console.error(`Error in User.transactions: ${err.message}`);
        throw new Error(err.message || "Internal Server Error");
      }
    },
  },
};

export default userResolver;
