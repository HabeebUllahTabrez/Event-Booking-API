const Event = require("../../models/event.model");
const User = require("../../models/user.model");
const { dateToString } = require("../../helpers/date");

transformEvent = (event) => {
  return {
    ...event.toObject(),
    date: dateToString(event.date),
    creator: user.bind(this, event.creator),
  };
};

transformBooking = (booking) => {
  return {
    ...booking.toObject(),
    createdAt: dateToString(booking.createdAt),
    updatedAt: dateToString(booking.updatedAt),
    user: user.bind(this, booking.user),
    event: singleEvent.bind(this, booking.event),
  };
};

events = async (eventIds) => {
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

singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

user = async (userId) => {
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

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
exports.events = events;
