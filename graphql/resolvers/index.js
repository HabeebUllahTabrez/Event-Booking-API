const authResolvers = require("./auth.resolvers");
const bookingResolvers = require("./booking.resolvers");
const eventResolvers = require("./event.resolvers");

const rootResolver = {
  ...bookingResolvers,
  ...eventResolvers,
  ...authResolvers,
};

module.exports = rootResolver;
