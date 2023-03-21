const bcrypt = require("bcryptjs");

const User = require("../../models/user.model");
const { events } = require("./transformations");

module.exports = {
  createUser: async (args) => {
    try {
      let existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error("User already exist");
      }

      let hashedPassword = bcrypt.hashSync(args.userInput.password, 12);

      let newUser = new User({
        email: args.userInput.email,
        password: hashedPassword,
      });

      let savedUser = await newUser.save();

      return {
        ...savedUser.toObject(),
        password: null,
        createdEvents: events.bind(this, savedUser.createdEvents),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
