const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const graphQLSchema = require("./graphql/schema");
const graphQLResolvers = require("./graphql/resolvers");
const isAuth = require("./middlewares/is-auth");

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI;

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(isAuth);

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
