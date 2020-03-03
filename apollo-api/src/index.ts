import { ApolloServer } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { typeDefs } from "./typedefs";
import { resolvers } from "./resolvers/index";
import commander from "commander";
// Code to set up a GraphQl endpoint that resolves to a Comunica based server. Effectively this means that
// GraphQL queries can be sent to a SPARQL (or LDF in another implementation) and the expected JSON is
// returned.

// Setting up the Apollo server
// The ApolloServer constructor requires two parameters: your schema

// The `listen` method launches a web server.
const DEFAULT_PORT = 3001;

export const schema = buildFederatedSchema([{ typeDefs, resolvers }]);
const server = new ApolloServer({ schema });
commander.option("-p, --port <port>", "Port number, defaults to "+DEFAULT_PORT)
commander.parse(process.argv);
const port = commander.port||DEFAULT_PORT;
server.listen(port, () =>console.log(`Listening at http://localhost:${port}/graphql`));
