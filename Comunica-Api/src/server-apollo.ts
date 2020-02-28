
import { makeExecutableSchema } from 'graphql-tools';
import { ApolloServer, Config, gql } from "apollo-server";
import { GraphQLSchema } from "graphql";
import { buildFederatedSchema } from "@apollo/federation";

let apolloServer: ApolloServer;

const init = (schema: GraphQLSchema) => {
  const APOLLO_CONFIG: Config = { schema }
  apolloServer = new ApolloServer(APOLLO_CONFIG);
}


export async function requestApollo(query: string) {
  return apolloServer.executeOperation({ query })

}

init(buildFederatedSchema({
  typeDefs: gql`
  type Query {
    identificatiecode: [String]
    bagstatus(label_nl: String): [String]
  }
  
  directive @single on FIELD_DEFINITION
  directive @plural on FIELD_DEFINITION`
}));
//
// requestApollo(// query
//   `
//   {
//     __schema {
//       types {
//         name
//       }
//     }
//   }
//   `
// ).then(console.info).catch(console.error)
