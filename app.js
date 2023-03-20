const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");

require("dotenv").config();

const graphQLSchema = require("./graphql/schema");
const graphQLResolvers = require("./graphql/resolvers");

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQLSchema,
    rootValue: graphQLResolvers,
    graphiql: true,
  })
);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`The server is listening on PORT: ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
