const bcrypt = require("bcryptjs");

const Event = require("../../models/event.model");
const User = require("../../models/user.model");

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } }).lean();
    return events.map((event) => {
      return {
        ...event,
        date: new Date(event.date).toISOString(),
        creator: user.bind(this, event.creator),
      };
    });
  } catch (error) {
    throw error;
  }
};

const user = async (userId) => {
  try {
    let user = await User.findById(userId);
    return {
      ...user.toObject(),
      password: null,
      createdEvents: events.bind(this, user.createdEvents),
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find().lean(); // .populate("creator")
      return events.map((event) => {
        return {
          ...event,
          date: new Date(event.date).toISOString(),
          creator: user.bind(this, event.creator),
        };
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
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

      let existingUser = await User.findById(event.creator);
      if (!existingUser) {
        throw new Error("User doesnt exist");
      }

      existingUser.createdEvents.push(event);
      await existingUser.save();

      let createdEvent = await event.save();

      return {
        ...createdEvent.toObject(),
        date: new Date(createdEvent.date).toISOString(),
        creator: user.bind(this, createdEvent.creator),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  createUser: async (args) => {
    try {
      let existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error("User already exist");
      }

      let hashedPassword = bcrypt.hashSync(args.userInput.password, 12);

      existingUser = new User({
        email: args.userInput.email,
        password: hashedPassword,
      });

      let result = await existingUser.save();

      return {
        ...result.toObject(),
        password: null,
        createdEvents: events.bind(this, user.createdEvents),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
