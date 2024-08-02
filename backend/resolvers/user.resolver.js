import { users } from "../dummyData/data.js";

const userResolver = {
  Query: {
    users: (_, _, { req, res }) => {
      return users;
    },
    user: (_, { userId }) => users.find((user) => user._id === userId),
  },
};

export default userResolver;
