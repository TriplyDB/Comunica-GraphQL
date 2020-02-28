import express from "express";
import {ApolloServer, ApolloServerExpressConfig} from "apollo-server-express";
import { buildFederatedSchema } from "@apollo/federation";
import {typeDefs } from "./typedefs";
import {resolvers} from './resolvers/index';

// Code to set up a GraphQl endpoint that resolves to a Comunica based server. Effectively this means that
// GraphQL queries can be sent to a SPARQL (or LDF in another implementation) and the expected JSON is
// returned.

// Setting up the Apollo server
function init(){

  const schema = buildFederatedSchema([ {typeDefs,resolvers }]);
  const APOLLO_CONFIG: ApolloServerExpressConfig = {schema, playground: true}
  const server = new ApolloServer(APOLLO_CONFIG);

  // Expose server
  const app = express();
  server.applyMiddleware({ app });
  const PORT = process.env.PORT || 3500;
  app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}/graphql`));
}
init()
