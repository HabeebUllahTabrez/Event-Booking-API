const Event = require("../../models/event.model");
const User = require("../../models/user.model");
const { dateToString } = require("../../helpers/date");

exports.transformEvent = (event) => {
  return {
    ...event.toObject(),
    date: dateToString(event.date),
    creator: user.bind(this, event.creator),
  };
};

exports.transformBooking = (booking) => {
  return {
    ...booking.toObject(),
    createdAt: dateToString(booking.createdAt),
    updatedAt: dateToString(booking.updatedAt),
    user: user.bind(this, booking.user),
    event: singleEvent.bind(this, booking.event),
  };
};

exports.events = async (eventIds) => {
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

exports.singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.user = async (userId) => {
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
