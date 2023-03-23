const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User does not exist!");
    }

    const isEqual = bcrypt.compareSync(password, user.password);

    if (!isEqual) {
      throw new Error("Password is incorrect!");
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      "somesupersecretkey",
      { expiresIn: "1h" }
    );

    return {
      userId: user._id,
      token: token,
      tokenExpiration: 1,
    };
  },
};
