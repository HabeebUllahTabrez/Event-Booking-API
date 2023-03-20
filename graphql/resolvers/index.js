const bcrypt = require("bcryptjs");

const Event = require("../../models/event.model");
const User = require("../../models/user.model");
const Booking = require("../../models/booking.model");
const { dateToString } = require("../../helpers/date");

const transformEvent = (event) => {
  return {
    ...event.toObject(),
    date: new Date(event.date).toISOString(),
    creator: user.bind(this, event.creator),
  };
};

const transformBooking = (booking) => {
  return {
    ...booking.toObject(),
    createdAt: dateToString(booking.createdAt),
    updatedAt: dateToString(booking.updatedAt),
    user: user.bind(this, booking.user),
    event: singleEvent.bind(this, booking.event),
  };
};

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map((event) => {
      return transformEvent(event);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch (error) {
    console.log(error);
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
    console.log(error);
    throw error;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find(); // .populate("creator")
      return events.map((event) => {
        return transformEvent(event);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map((booking) => {
        return transformBooking(booking);
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
      return transformEvent(createdEvent);
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
  bookEvent: async (args) => {
    try {
      // const fetchedEvent = await Event.findById(args.eventId);
      const booking = new Booking({
        user: "64183034b725e37ed82657ac",
        event: args.eventId,
      });
      const result = await booking.save();
      return transformBooking(result);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  cancelBooking: async (args) => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");

      if (!booking) {
        throw new Error("Booking does not exist");
      }

      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });

      return event;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
