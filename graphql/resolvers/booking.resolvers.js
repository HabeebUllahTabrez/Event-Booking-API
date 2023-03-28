const Booking = require("../../models/booking.model");
const { transformEvent, transformBooking } = require("./transformations");

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    try {
      const bookings = await Booking.find({ user: req.userId });
      return bookings.map((booking) => {
        return transformBooking(booking);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    try {
      // const fetchedEvent = await Event.findById(args.eventId);
      const booking = new Booking({
        user: req.userId,
        event: args.eventId,
      });
      const result = await booking.save();
      return transformBooking(result);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
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
