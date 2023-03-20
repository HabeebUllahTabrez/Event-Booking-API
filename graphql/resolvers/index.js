const bcrypt = require("bcryptjs");

const Event = require("../../models/event.model");
const User = require("../../models/user.model");

// const user = async (userId) => {
//   try {
//     let user = await User.findById(userId);
//     return user;
//   } catch (error) {
//     throw error;
//   }
// };


module.exports = {
  events: () => {
    return Event.find()
      .populate("creator")
      .lean()
      .then((events) => {
        return events;
      })
      .catch((err) => {
        console.log(err);
        throw error;
      });
  },
  createEvent: async (args) => {
    try {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: "64183034b725e37ed82657ac",
      });

      let user = await User.findById(event.creator);
      if (!user) {
        throw new Error("User doesnt exist");
      }

      user.createdEvents.push(event);
      await user.save();

      let response = await event.save();

      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  createUser: async (args) => {
    try {
      let user = await User.findOne({ email: args.userInput.email });
      if (user) {
        throw new Error("User already exist");
      }

      let result;
      let hashedPassword = bcrypt.hashSync(args.userInput.password, 12);

      user = new User({
        email: args.userInput.email,
        password: hashedPassword,
      });

      result = await user.save();
      result.password = null;

      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
