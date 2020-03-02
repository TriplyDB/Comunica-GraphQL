import { ApolloServer } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { typeDefs } from "./typedefs";
import { resolvers } from "./resolvers/index";

// Code to set up a GraphQl endpoint that resolves to a Comunica based server. Effectively this means that
// GraphQL queries can be sent to a SPARQL (or LDF in another implementation) and the expected JSON is
// returned.

// Setting up the Apollo server
// The ApolloServer constructor requires two parameters: your schema

// The `listen` method launches a web server.

export const schema = buildFederatedSchema([{ typeDefs, resolvers }]);
function init() {
  const server = new ApolloServer({ schema });
  // Expose server
  const PORT = 3001;
  server.listen(PORT, () =>
    console.log(`Listening at http://localhost:${PORT}/graphql`)
  );
}
init();
