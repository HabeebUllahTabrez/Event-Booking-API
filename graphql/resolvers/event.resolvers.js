const Event = require("../../models/event.model");
const User = require("../../models/user.model");
const { transformEvent } = require("./transformations");

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
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    try {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: req.userId,
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
};
